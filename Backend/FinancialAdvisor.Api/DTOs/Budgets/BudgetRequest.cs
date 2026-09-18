namespace FinancialAdvisor.Api.DTOs.Budgets;

public sealed record BudgetRequest(decimal Amount, Guid? CategoryId, int Month, int Year);
