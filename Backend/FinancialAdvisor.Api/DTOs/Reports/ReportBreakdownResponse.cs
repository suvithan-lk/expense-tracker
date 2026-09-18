namespace FinancialAdvisor.Api.DTOs.Reports;

public sealed record ReportBreakdownResponse(Guid CategoryId, string CategoryName, decimal Amount, decimal Percentage);
