namespace FinancialAdvisor.Api.DTOs.Expenses;

public sealed record ExpenseRequest(decimal Amount, Guid CategoryId, string? Description, DateOnly ExpenseDate);
