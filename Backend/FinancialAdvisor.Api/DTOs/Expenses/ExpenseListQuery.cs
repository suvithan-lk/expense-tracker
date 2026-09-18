namespace FinancialAdvisor.Api.DTOs.Expenses;

public sealed record ExpenseListQuery(
    int? Page,
    int? PageSize,
    string? Sort,
    string? Search,
    Guid? CategoryId,
    DateOnly? From,
    DateOnly? To);
