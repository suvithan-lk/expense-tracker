namespace FinancialAdvisor.Api.DTOs.Dashboard;

public sealed record DashboardActivity(Guid Id, string Type, string Label, string CategoryName, decimal Amount, DateOnly Date);
