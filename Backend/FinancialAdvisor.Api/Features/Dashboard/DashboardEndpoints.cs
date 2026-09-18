using System.Security.Claims;
using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.DTOs.Dashboard;
using FinancialAdvisor.Api.Services.Dashboard;

namespace FinancialAdvisor.Api.Features.Dashboard;

public static class DashboardEndpoints
{
    public static void MapDashboardEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/dashboard").RequireAuthorization();

        group.MapGet("/summary", async (
            string? period,
            DateOnly? from,
            DateOnly? to,
            ClaimsPrincipal principal,
            IDashboardService dashboardService,
            CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var resolvedPeriod = string.IsNullOrWhiteSpace(period) ? "currentMonth" : period;
            var summary = await dashboardService.GetSummaryAsync(userId, resolvedPeriod, from, to, cancellationToken);
            return Results.Ok(new ApiResponse<DashboardSummaryResponse> { Data = summary });
        });
    }

    private static Guid GetUserId(ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub");
        return Guid.Parse(value!);
    }
}
