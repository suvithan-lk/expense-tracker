namespace FinancialAdvisor.Api.DTOs.Dashboard;

public sealed record DashboardCategoryDto(Guid CategoryId, string CategoryName, decimal Amount, decimal Percentage);
