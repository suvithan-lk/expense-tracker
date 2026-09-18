namespace FinancialAdvisor.Api.DTOs.Budgets;

public sealed record BudgetListResponse(IReadOnlyList<BudgetResponse> Items, int TotalCount);
