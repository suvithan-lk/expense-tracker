namespace FinancialAdvisor.Api.DTOs.Budgets;

public sealed record BudgetResponse(
    Guid Id,
    Guid UserId,
    Guid? CategoryId,
    string? CategoryName,
    decimal Amount,
    decimal SpentAmount,
    decimal RemainingAmount,
    decimal UsagePercentage,
    int Month,
    int Year,
    DateTime CreatedAt,
    DateTime UpdatedAt);
