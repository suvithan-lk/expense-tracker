using System.Security.Claims;
using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.DTOs.Expenses;
using FinancialAdvisor.Api.Services.Expenses;

namespace FinancialAdvisor.Api.Features.Expenses;

public static class ExpenseEndpoints
{
    public static void MapExpenseEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/expenses").RequireAuthorization();

        group.MapGet("/", async (
            int? page,
            int? pageSize,
            string? sort,
            string? search,
            Guid? categoryId,
            DateOnly? from,
            DateOnly? to,
            ClaimsPrincipal principal,
            IExpenseService expenseService,
            CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var query = new ExpenseListQuery(page, pageSize, sort, search, categoryId, from, to);
            var result = await expenseService.ListAsync(userId, query, cancellationToken);
            return Results.Ok(new ApiResponse<PagedResult<ExpenseTransactionResponse>> { Data = result });
        });

        group.MapGet("/{id:guid}", async (Guid id, ClaimsPrincipal principal, IExpenseService expenseService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var transaction = await expenseService.GetAsync(userId, id, cancellationToken);
            return Results.Ok(new ApiResponse<ExpenseTransactionResponse> { Data = transaction });
        });

        group.MapPost("/", async (ExpenseRequest request, ClaimsPrincipal principal, IExpenseService expenseService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var transaction = await expenseService.CreateAsync(userId, request, cancellationToken);
            return Results.Created($"/api/expenses/{transaction.Id}", new ApiResponse<ExpenseTransactionResponse> { Data = transaction });
        });

        group.MapPut("/{id:guid}", async (Guid id, ExpenseRequest request, ClaimsPrincipal principal, IExpenseService expenseService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var transaction = await expenseService.UpdateAsync(userId, id, request, cancellationToken);
            return Results.Ok(new ApiResponse<ExpenseTransactionResponse> { Data = transaction });
        });

        group.MapDelete("/{id:guid}", async (Guid id, ClaimsPrincipal principal, IExpenseService expenseService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            await expenseService.DeleteAsync(userId, id, cancellationToken);
            return Results.NoContent();
        });
    }

    private static Guid GetUserId(ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub");
        return Guid.Parse(value!);
    }
}
