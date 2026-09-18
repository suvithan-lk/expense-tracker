using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.Data;
using FinancialAdvisor.Api.DTOs.Categories;
using FinancialAdvisor.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FinancialAdvisor.Api.Services.Categories;

public sealed class CategoryService(AppDbContext dbContext) : ICategoryService
{
    private const int MaxNameLength = 100;

    public IReadOnlyList<Category> BuildDefaultCategories(Guid userId, DateTime timestamp)
    {
        var categories = new List<Category>();

        categories.AddRange(DefaultCategories.Income.Select(name => new Category
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name,
            Type = CategoryType.Income,
            CreatedAt = timestamp,
            UpdatedAt = timestamp,
        }));

        categories.AddRange(DefaultCategories.Expense.Select(name => new Category
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name,
            Type = CategoryType.Expense,
            CreatedAt = timestamp,
            UpdatedAt = timestamp,
        }));

        return categories;
    }

    public async Task<IReadOnlyList<CategoryResponse>> ListAsync(Guid userId, CategoryType type, CancellationToken cancellationToken)
    {
        var categories = await dbContext.Categories
            .Where(c => c.UserId == userId && c.Type == type)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return categories.Select(ToResponse).ToList();
    }

    public async Task<CategoryResponse> CreateAsync(Guid userId, CreateCategoryRequest request, CancellationToken cancellationToken)
    {
        var type = ParseType(request.Type);
        var name = ValidateName(request.Name);

        await EnsureNameIsUniqueAsync(userId, type, name, excludingId: null, cancellationToken);

        var now = DateTime.UtcNow;
        var category = new Category
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name,
            Type = type,
            CreatedAt = now,
            UpdatedAt = now,
        };

        dbContext.Categories.Add(category);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(category);
    }

    public async Task<CategoryResponse> RenameAsync(Guid userId, Guid categoryId, RenameCategoryRequest request, CancellationToken cancellationToken)
    {
        var category = await FindOwnedCategoryAsync(userId, categoryId, cancellationToken);
        var name = ValidateName(request.Name);

        await EnsureNameIsUniqueAsync(userId, category.Type, name, excludingId: category.Id, cancellationToken);

        category.Name = name;
        category.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(category);
    }

    public async Task DeleteAsync(Guid userId, Guid categoryId, CancellationToken cancellationToken)
    {
        var category = await FindOwnedCategoryAsync(userId, categoryId, cancellationToken);

        var hasDependentTransactions = category.Type == CategoryType.Income
            ? await dbContext.IncomeTransactions.AnyAsync(t => t.CategoryId == categoryId, cancellationToken)
            : await dbContext.ExpenseTransactions.AnyAsync(t => t.CategoryId == categoryId, cancellationToken);

        if (hasDependentTransactions)
        {
            throw new ConflictAppException("This category has existing transactions and cannot be deleted. Reassign or delete those transactions first.");
        }

        var hasDependentBudgets = await dbContext.Budgets.AnyAsync(b => b.CategoryId == categoryId, cancellationToken);

        if (hasDependentBudgets)
        {
            throw new ConflictAppException("This category has an existing budget and cannot be deleted. Remove the budget first.");
        }

        dbContext.Categories.Remove(category);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<Category> FindOwnedCategoryAsync(Guid userId, Guid categoryId, CancellationToken cancellationToken)
    {
        return await dbContext.Categories.FirstOrDefaultAsync(c => c.Id == categoryId && c.UserId == userId, cancellationToken)
            ?? throw new NotFoundAppException("Category not found.");
    }

    private async Task EnsureNameIsUniqueAsync(Guid userId, CategoryType type, string name, Guid? excludingId, CancellationToken cancellationToken)
    {
        var normalized = name.ToLowerInvariant();

        var duplicateExists = await dbContext.Categories
            .Where(c => c.UserId == userId && c.Type == type && c.Id != (excludingId ?? Guid.Empty))
            .AnyAsync(c => c.Name.ToLower() == normalized, cancellationToken);

        if (duplicateExists)
        {
            throw new ConflictAppException("A category with this name already exists.");
        }
    }

    private static string ValidateName(string name)
    {
        var trimmed = name?.Trim() ?? string.Empty;

        if (string.IsNullOrEmpty(trimmed))
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["name"] = ["Category name is required."],
            });
        }

        if (trimmed.Length > MaxNameLength)
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["name"] = [$"Category name must be at most {MaxNameLength} characters."],
            });
        }

        return trimmed;
    }

    private static CategoryType ParseType(string type)
    {
        if (string.Equals(type, "income", StringComparison.OrdinalIgnoreCase))
        {
            return CategoryType.Income;
        }

        if (string.Equals(type, "expense", StringComparison.OrdinalIgnoreCase))
        {
            return CategoryType.Expense;
        }

        throw new ValidationAppException(new Dictionary<string, string[]>
        {
            ["type"] = ["Type must be 'income' or 'expense'."],
        });
    }

    private static CategoryResponse ToResponse(Category category) => new(
        category.Id,
        category.Name,
        category.Type.ToString().ToLowerInvariant(),
        category.CreatedAt,
        category.UpdatedAt);
}
