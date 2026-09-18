namespace FinancialAdvisor.Api.DTOs.Dashboard;

public sealed record DashboardSummaryResponse(
    decimal TotalIncome,
    decimal TotalExpenses,
    decimal Balance,
    decimal Savings,
    decimal SavingsRate,
    int IncomeCount,
    int ExpenseCount,
    decimal? PreviousTotalExpenses,
    IReadOnlyList<DashboardCategoryDto>? PreviousExpenseByCategory,
    IReadOnlyList<DashboardCategoryDto> ExpenseByCategory,
    IReadOnlyList<object>? BudgetUsage,
    IReadOnlyList<DashboardCashFlowPoint> CashFlow,
    IReadOnlyList<DashboardActivity> RecentActivity);
