using System.Security.Claims;
using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.DTOs.Income;
using FinancialAdvisor.Api.Services.Income;

namespace FinancialAdvisor.Api.Features.Income;

public static class IncomeEndpoints
{
    public static void MapIncomeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/income").RequireAuthorization();

        group.MapGet("/", async (
            int? page,
            int? pageSize,
            string? sort,
            string? search,
            Guid? categoryId,
            DateOnly? from,
            DateOnly? to,
            ClaimsPrincipal principal,
            IIncomeService incomeService,
            CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var query = new IncomeListQuery(page, pageSize, sort, search, categoryId, from, to);
            var result = await incomeService.ListAsync(userId, query, cancellationToken);
            return Results.Ok(new ApiResponse<PagedResult<IncomeTransactionResponse>> { Data = result });
        });

        group.MapGet("/{id:guid}", async (Guid id, ClaimsPrincipal principal, IIncomeService incomeService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var transaction = await incomeService.GetAsync(userId, id, cancellationToken);
            return Results.Ok(new ApiResponse<IncomeTransactionResponse> { Data = transaction });
        });

        group.MapPost("/", async (IncomeRequest request, ClaimsPrincipal principal, IIncomeService incomeService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var transaction = await incomeService.CreateAsync(userId, request, cancellationToken);
            return Results.Created($"/api/income/{transaction.Id}", new ApiResponse<IncomeTransactionResponse> { Data = transaction });
        });

        group.MapPut("/{id:guid}", async (Guid id, IncomeRequest request, ClaimsPrincipal principal, IIncomeService incomeService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var transaction = await incomeService.UpdateAsync(userId, id, request, cancellationToken);
            return Results.Ok(new ApiResponse<IncomeTransactionResponse> { Data = transaction });
        });

        group.MapDelete("/{id:guid}", async (Guid id, ClaimsPrincipal principal, IIncomeService incomeService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            await incomeService.DeleteAsync(userId, id, cancellationToken);
            return Results.NoContent();
        });
    }

    private static Guid GetUserId(ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub");
        return Guid.Parse(value!);
    }
}
