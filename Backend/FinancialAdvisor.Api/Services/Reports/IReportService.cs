using FinancialAdvisor.Api.DTOs.Reports;

namespace FinancialAdvisor.Api.Services.Reports;

public interface IReportService
{
    Task<FinancialReportResponse> GetSummaryAsync(Guid userId, DateOnly from, DateOnly to, Guid? categoryId, CancellationToken cancellationToken);
}
