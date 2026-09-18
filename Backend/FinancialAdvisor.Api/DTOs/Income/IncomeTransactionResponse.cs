namespace FinancialAdvisor.Api.DTOs.Income;

public sealed record IncomeTransactionResponse(
    Guid Id,
    Guid UserId,
    Guid CategoryId,
    string? CategoryName,
    decimal Amount,
    string? Description,
    DateOnly IncomeDate,
    DateTime CreatedAt,
    DateTime UpdatedAt);
