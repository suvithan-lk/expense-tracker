namespace FinancialAdvisor.Api.DTOs.Reports;

public sealed record FinancialReportResponse(
    string PeriodLabel,
    decimal TotalIncome,
    decimal TotalExpenses,
    decimal NetBalance,
    decimal Savings,
    decimal SavingsRate,
    ReportBreakdownResponse? HighestExpenseCategory,
    IReadOnlyList<ReportBreakdownResponse> IncomeBreakdown,
    IReadOnlyList<ReportBreakdownResponse> ExpenseBreakdown,
    IReadOnlyList<ReportBudgetPerformanceResponse> BudgetPerformance,
    ReportComparisonResponse? Comparison);
