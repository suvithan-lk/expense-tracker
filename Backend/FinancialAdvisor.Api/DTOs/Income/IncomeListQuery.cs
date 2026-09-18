namespace FinancialAdvisor.Api.DTOs.Income;

public sealed record IncomeListQuery(
    int? Page,
    int? PageSize,
    string? Sort,
    string? Search,
    Guid? CategoryId,
    DateOnly? From,
    DateOnly? To);
