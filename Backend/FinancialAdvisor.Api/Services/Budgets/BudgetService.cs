using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.Data;
using FinancialAdvisor.Api.DTOs.Budgets;
using FinancialAdvisor.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FinancialAdvisor.Api.Services.Budgets;

public sealed class BudgetService(AppDbContext dbContext) : IBudgetService
{
    public async Task<BudgetListResponse> ListAsync(Guid userId, int month, int year, Guid? categoryId, CancellationToken cancellationToken)
    {
        ValidatePeriod(month, year);

        var budgetsQuery = dbContext.Budgets
            .Include(b => b.Category)
            .Where(b => b.UserId == userId && b.Month == month && b.Year == year);

        if (categoryId is { } filterId)
        {
            budgetsQuery = budgetsQuery.Where(b => b.CategoryId == filterId);
        }

        var budgets = await budgetsQuery.ToListAsync(cancellationToken);
        var ordered = budgets
            .OrderBy(b => b.CategoryId.HasValue ? 1 : 0)
            .ThenBy(b => b.Category?.Name ?? string.Empty)
            .ToList();

        var (start, end) = MonthRange(month, year);

        var expensesInRange = dbContext.ExpenseTransactions
            .Where(t => t.UserId == userId && t.ExpenseDate >= start && t.ExpenseDate <= end);

        var totalExpenses = await expensesInRange.SumAsync(t => t.Amount, cancellationToken);

        var expenseByCategory = await expensesInRange
            .GroupBy(t => t.CategoryId)
            .Select(g => new { CategoryId = g.Key, Amount = g.Sum(t => t.Amount) })
            .ToDictionaryAsync(g => g.CategoryId, g => g.Amount, cancellationToken);

        var items = ordered
            .Select(b => ToResponse(b, b.CategoryId is { } cid ? expenseByCategory.GetValueOrDefault(cid) : totalExpenses))
            .ToList();

        return new BudgetListResponse(items, items.Count);
    }

    public async Task<BudgetResponse> CreateAsync(Guid userId, BudgetRequest request, CancellationToken cancellationToken)
    {
        ValidateRequest(request);
        var category = await FindOwnedExpenseCategoryAsync(userId, request.CategoryId, cancellationToken);

        await EnsureNoDuplicateAsync(userId, request.CategoryId, request.Month, request.Year, excludingId: null, cancellationToken);

        var now = DateTime.UtcNow;
        var budget = new Budget
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CategoryId = category?.Id,
            Amount = request.Amount,
            Month = request.Month,
            Year = request.Year,
            CreatedAt = now,
            UpdatedAt = now,
        };

        dbContext.Budgets.Add(budget);
        await dbContext.SaveChangesAsync(cancellationToken);

        var spent = await CalculateSpentAsync(userId, budget.CategoryId, budget.Month, budget.Year, cancellationToken);
        return ToResponse(budget, spent, category?.Name);
    }

    public async Task<BudgetResponse> UpdateAsync(Guid userId, Guid id, BudgetRequest request, CancellationToken cancellationToken)
    {
        ValidateRequest(request);
        var budget = await FindOwnedAsync(userId, id, cancellationToken);
        var category = await FindOwnedExpenseCategoryAsync(userId, request.CategoryId, cancellationToken);

        await EnsureNoDuplicateAsync(userId, request.CategoryId, request.Month, request.Year, excludingId: budget.Id, cancellationToken);

        budget.CategoryId = category?.Id;
        budget.Amount = request.Amount;
        budget.Month = request.Month;
        budget.Year = request.Year;
        budget.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        var spent = await CalculateSpentAsync(userId, budget.CategoryId, budget.Month, budget.Year, cancellationToken);
        return ToResponse(budget, spent, category?.Name);
    }

    public async Task DeleteAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        var budget = await FindOwnedAsync(userId, id, cancellationToken);
        dbContext.Budgets.Remove(budget);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<Budget> FindOwnedAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        return await dbContext.Budgets
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId, cancellationToken)
            ?? throw new NotFoundAppException("Budget not found.");
    }

    private async Task<Category?> FindOwnedExpenseCategoryAsync(Guid userId, Guid? categoryId, CancellationToken cancellationToken)
    {
        if (categoryId is null)
        {
            return null;
        }

        var category = await dbContext.Categories
            .FirstOrDefaultAsync(c => c.Id == categoryId && c.UserId == userId, cancellationToken);

        if (category is null || category.Type != CategoryType.Expense)
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["categoryId"] = ["Choose a valid expense category, or leave it blank for a total budget."],
            });
        }

        return category;
    }

    private async Task EnsureNoDuplicateAsync(Guid userId, Guid? categoryId, int month, int year, Guid? excludingId, CancellationToken cancellationToken)
    {
        var duplicateExists = await dbContext.Budgets
            .Where(b => b.Id != (excludingId ?? Guid.Empty))
            .AnyAsync(b => b.UserId == userId && b.CategoryId == categoryId && b.Month == month && b.Year == year, cancellationToken);

        if (duplicateExists)
        {
            throw new ConflictAppException(categoryId is null
                ? "A total budget already exists for this month."
                : "A budget for this category already exists for this month.");
        }
    }

    private async Task<decimal> CalculateSpentAsync(Guid userId, Guid? categoryId, int month, int year, CancellationToken cancellationToken)
    {
        var (start, end) = MonthRange(month, year);
        var expenses = dbContext.ExpenseTransactions
            .Where(t => t.UserId == userId && t.ExpenseDate >= start && t.ExpenseDate <= end);

        if (categoryId is { } cid)
        {
            expenses = expenses.Where(t => t.CategoryId == cid);
        }

        return await expenses.SumAsync(t => t.Amount, cancellationToken);
    }

    private static (DateOnly Start, DateOnly End) MonthRange(int month, int year)
    {
        var start = new DateOnly(year, month, 1);
        return (start, start.AddMonths(1).AddDays(-1));
    }

    private static void ValidatePeriod(int month, int year)
    {
        var errors = new Dictionary<string, string[]>();

        if (month is < 1 or > 12)
        {
            errors["month"] = ["Month must be between 1 and 12."];
        }

        if (year is < 2000 or > 2100)
        {
            errors["year"] = ["Year must be between 2000 and 2100."];
        }

        if (errors.Count > 0)
        {
            throw new ValidationAppException(errors);
        }
    }

    private static void ValidateRequest(BudgetRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (request.Amount <= 0)
        {
            errors["amount"] = ["Budget amount must be greater than zero."];
        }

        if (request.Month is < 1 or > 12)
        {
            errors["month"] = ["Month must be between 1 and 12."];
        }

        if (request.Year is < 2000 or > 2100)
        {
            errors["year"] = ["Year must be between 2000 and 2100."];
        }

        if (errors.Count > 0)
        {
            throw new ValidationAppException(errors);
        }
    }

    private static BudgetResponse ToResponse(Budget budget, decimal spentAmount, string? categoryName = null)
    {
        var remaining = budget.Amount - spentAmount;
        var usagePercentage = budget.Amount > 0 ? Math.Round(spentAmount / budget.Amount * 100m, 2) : 0m;

        return new BudgetResponse(
            budget.Id,
            budget.UserId,
            budget.CategoryId,
            categoryName ?? budget.Category?.Name,
            budget.Amount,
            spentAmount,
            remaining,
            usagePercentage,
            budget.Month,
            budget.Year,
            budget.CreatedAt,
            budget.UpdatedAt);
    }
}
