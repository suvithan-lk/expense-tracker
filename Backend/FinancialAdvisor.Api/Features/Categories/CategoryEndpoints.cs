using System.Security.Claims;
using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.DTOs.Categories;
using FinancialAdvisor.Api.Models;
using FinancialAdvisor.Api.Services.Categories;

namespace FinancialAdvisor.Api.Features.Categories;

public static class CategoryEndpoints
{
    public static void MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/categories").RequireAuthorization();

        group.MapGet("/", async (string? type, ClaimsPrincipal principal, ICategoryService categoryService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var categoryType = ParseType(type);
            var categories = await categoryService.ListAsync(userId, categoryType, cancellationToken);
            return Results.Ok(new ApiResponse<IReadOnlyList<CategoryResponse>> { Data = categories });
        });

        group.MapPost("/", async (CreateCategoryRequest request, ClaimsPrincipal principal, ICategoryService categoryService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var category = await categoryService.CreateAsync(userId, request, cancellationToken);
            return Results.Created($"/api/categories/{category.Id}", new ApiResponse<CategoryResponse> { Data = category });
        });

        group.MapPut("/{id:guid}", async (Guid id, RenameCategoryRequest request, ClaimsPrincipal principal, ICategoryService categoryService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            var category = await categoryService.RenameAsync(userId, id, request, cancellationToken);
            return Results.Ok(new ApiResponse<CategoryResponse> { Data = category });
        });

        group.MapDelete("/{id:guid}", async (Guid id, ClaimsPrincipal principal, ICategoryService categoryService, CancellationToken cancellationToken) =>
        {
            var userId = GetUserId(principal);
            await categoryService.DeleteAsync(userId, id, cancellationToken);
            return Results.NoContent();
        });
    }

    private static Guid GetUserId(ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub");
        return Guid.Parse(value!);
    }

    private static CategoryType ParseType(string? type)
    {
        if (string.Equals(type, "income", StringComparison.OrdinalIgnoreCase))
        {
            return CategoryType.Income;
        }

        if (string.Equals(type, "expense", StringComparison.OrdinalIgnoreCase))
        {
            return CategoryType.Expense;
        }

        throw new ValidationAppException(new Dictionary<string, string[]>
        {
            ["type"] = ["Type query parameter is required and must be 'income' or 'expense'."],
        });
    }
}
