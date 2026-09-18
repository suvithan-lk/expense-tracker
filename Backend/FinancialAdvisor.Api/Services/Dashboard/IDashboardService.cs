using FinancialAdvisor.Api.DTOs.Dashboard;

namespace FinancialAdvisor.Api.Services.Dashboard;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetSummaryAsync(Guid userId, string period, DateOnly? from, DateOnly? to, CancellationToken cancellationToken);
}
