namespace FinancialAdvisor.Api.DTOs.Income;

public sealed record IncomeRequest(decimal Amount, Guid CategoryId, string? Description, DateOnly IncomeDate);
