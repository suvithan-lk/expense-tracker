using System.Security.Claims;
using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.DTOs.Reports;
using FinancialAdvisor.Api.Services.Reports;

namespace FinancialAdvisor.Api.Features.Reports;

public static class ReportEndpoints
{
    public static void MapReportEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reports").RequireAuthorization();

        group.MapGet("/summary", async (
            DateOnly from,
            DateOnly to,
            Guid? categoryId,
            ClaimsPrincipal principal,
            IReportService reportService,
            CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var report = await reportService.GetSummaryAsync(userId, from, to, categoryId, cancellationToken);
            return Results.Ok(new ApiResponse<FinancialReportResponse> { Data = report });
        });
    }

    private static Guid GetUserId(ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub");
        return Guid.Parse(value!);
    }
}
