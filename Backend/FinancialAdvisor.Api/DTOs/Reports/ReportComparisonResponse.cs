namespace FinancialAdvisor.Api.DTOs.Reports;

public sealed record ReportComparisonResponse(
    string PreviousPeriodLabel,
    decimal IncomeChangePercentage,
    decimal ExpenseChangePercentage,
    decimal BalanceChangePercentage);
