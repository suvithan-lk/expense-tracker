using System.Security.Claims;
using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.DTOs.Budgets;
using FinancialAdvisor.Api.Services.Budgets;

namespace FinancialAdvisor.Api.Features.Budgets;

public static class BudgetEndpoints
{
    public static void MapBudgetEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/budgets").RequireAuthorization();

        group.MapGet("/", async (
            int month,
            int year,
            Guid? categoryId,
            ClaimsPrincipal principal,
            IBudgetService budgetService,
            CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var result = await budgetService.ListAsync(userId, month, year, categoryId, cancellationToken);
            return Results.Ok(new ApiResponse<BudgetListResponse> { Data = result });
        });

        group.MapPost("/", async (BudgetRequest request, ClaimsPrincipal principal, IBudgetService budgetService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var budget = await budgetService.CreateAsync(userId, request, cancellationToken);
            return Results.Created($"/api/budgets/{budget.Id}", new ApiResponse<BudgetResponse> { Data = budget });
        });

        group.MapPut("/{id:guid}", async (Guid id, BudgetRequest request, ClaimsPrincipal principal, IBudgetService budgetService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var budget = await budgetService.UpdateAsync(userId, id, request, cancellationToken);
            return Results.Ok(new ApiResponse<BudgetResponse> { Data = budget });
        });

        group.MapDelete("/{id:guid}", async (Guid id, ClaimsPrincipal principal, IBudgetService budgetService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            await budgetService.DeleteAsync(userId, id, cancellationToken);
            return Results.NoContent();
        });
    }

    private static Guid GetUserId(ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub");
        return Guid.Parse(value!);
    }
}
