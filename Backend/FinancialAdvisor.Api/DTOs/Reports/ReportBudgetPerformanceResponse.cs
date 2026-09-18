namespace FinancialAdvisor.Api.DTOs.Reports;

public sealed record ReportBudgetPerformanceResponse(
    Guid Id,
    string CategoryName,
    decimal BudgetAmount,
    decimal SpentAmount,
    decimal UsagePercentage);
