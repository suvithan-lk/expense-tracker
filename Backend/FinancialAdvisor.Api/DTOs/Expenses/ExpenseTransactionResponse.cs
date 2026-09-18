namespace FinancialAdvisor.Api.DTOs.Expenses;

public sealed record ExpenseTransactionResponse(
    Guid Id,
    Guid UserId,
    Guid CategoryId,
    string? CategoryName,
    decimal Amount,
    string? Description,
    DateOnly ExpenseDate,
    DateTime CreatedAt,
    DateTime UpdatedAt);
