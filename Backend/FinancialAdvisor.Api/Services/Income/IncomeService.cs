using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.Data;
using FinancialAdvisor.Api.DTOs.Income;
using FinancialAdvisor.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FinancialAdvisor.Api.Services.Income;

public sealed class IncomeService(AppDbContext dbContext) : IIncomeService
{
    private const int MaxDescriptionLength = 500;

    private static readonly HashSet<string> AllowedSortFields = new(StringComparer.OrdinalIgnoreCase)
    {
        "incomeDate",
        "amount",
    };

    public async Task<PagedResult<IncomeTransactionResponse>> ListAsync(Guid userId, IncomeListQuery query, CancellationToken cancellationToken)
    {
        var (page, pageSize) = Paging.Normalize(query.Page, query.PageSize);
        var sort = SortParser.Parse(query.Sort, defaultField: "incomeDate", AllowedSortFields);

        var transactions = dbContext.IncomeTransactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            transactions = transactions.Where(t => t.Description != null && EF.Functions.ILike(t.Description, $"%{search}%"));
        }

        if (query.CategoryId is { } categoryId)
        {
            transactions = transactions.Where(t => t.CategoryId == categoryId);
        }

        if (query.From is { } from)
        {
            transactions = transactions.Where(t => t.IncomeDate >= from);
        }

        if (query.To is { } to)
        {
            transactions = transactions.Where(t => t.IncomeDate <= to);
        }

        transactions = (sort.Field, sort.Descending) switch
        {
            ("amount", true) => transactions.OrderByDescending(t => t.Amount),
            ("amount", false) => transactions.OrderBy(t => t.Amount),
            (_, true) => transactions.OrderByDescending(t => t.IncomeDate),
            (_, false) => transactions.OrderBy(t => t.IncomeDate),
        };

        var totalCount = await transactions.CountAsync(cancellationToken);
        var pageEntities = await transactions
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = pageEntities.Select(t => ToResponse(t)).ToList();

        return new PagedResult<IncomeTransactionResponse>(items, totalCount, page, pageSize);
    }

    public async Task<IncomeTransactionResponse> GetAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        var transaction = await FindOwnedAsync(userId, id, cancellationToken);
        return ToResponse(transaction);
    }

    public async Task<IncomeTransactionResponse> CreateAsync(Guid userId, IncomeRequest request, CancellationToken cancellationToken)
    {
        ValidateRequest(request);
        var category = await FindOwnedCategoryAsync(userId, request.CategoryId, cancellationToken);

        var now = DateTime.UtcNow;
        var transaction = new IncomeTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CategoryId = category.Id,
            Amount = request.Amount,
            Description = request.Description?.Trim(),
            IncomeDate = request.IncomeDate,
            CreatedAt = now,
            UpdatedAt = now,
        };

        dbContext.IncomeTransactions.Add(transaction);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(transaction, category.Name);
    }

    public async Task<IncomeTransactionResponse> UpdateAsync(Guid userId, Guid id, IncomeRequest request, CancellationToken cancellationToken)
    {
        ValidateRequest(request);
        var transaction = await FindOwnedAsync(userId, id, cancellationToken);
        var category = await FindOwnedCategoryAsync(userId, request.CategoryId, cancellationToken);

        transaction.CategoryId = category.Id;
        transaction.Amount = request.Amount;
        transaction.Description = request.Description?.Trim();
        transaction.IncomeDate = request.IncomeDate;
        transaction.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(transaction, category.Name);
    }

    public async Task DeleteAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        var transaction = await FindOwnedAsync(userId, id, cancellationToken);
        dbContext.IncomeTransactions.Remove(transaction);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<IncomeTransaction> FindOwnedAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        return await dbContext.IncomeTransactions
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, cancellationToken)
            ?? throw new NotFoundAppException("Income transaction not found.");
    }

    private async Task<Category> FindOwnedCategoryAsync(Guid userId, Guid categoryId, CancellationToken cancellationToken)
    {
        var category = await dbContext.Categories
            .FirstOrDefaultAsync(c => c.Id == categoryId && c.UserId == userId, cancellationToken);

        if (category is null || category.Type != CategoryType.Income)
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["categoryId"] = ["Choose a valid income category."],
            });
        }

        return category;
    }

    private static void ValidateRequest(IncomeRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (request.Amount <= 0)
        {
            errors["amount"] = ["Amount must be greater than zero."];
        }

        if (request.CategoryId == Guid.Empty)
        {
            errors["categoryId"] = ["Category is required."];
        }

        if (request.IncomeDate == default)
        {
            errors["incomeDate"] = ["Date is required."];
        }

        if (request.Description is { Length: > MaxDescriptionLength })
        {
            errors["description"] = [$"Description must be at most {MaxDescriptionLength} characters."];
        }

        if (errors.Count > 0)
        {
            throw new ValidationAppException(errors);
        }
    }

    private static IncomeTransactionResponse ToResponse(IncomeTransaction transaction, string? categoryName = null) => new(
        transaction.Id,
        transaction.UserId,
        transaction.CategoryId,
        categoryName ?? transaction.Category?.Name,
        transaction.Amount,
        transaction.Description,
        transaction.IncomeDate,
        transaction.CreatedAt,
        transaction.UpdatedAt);
}
