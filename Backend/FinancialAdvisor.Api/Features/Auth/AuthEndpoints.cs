using System.Security.Claims;
using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.DTOs.Auth;
using FinancialAdvisor.Api.Services.Auth;

namespace FinancialAdvisor.Api.Features.Auth;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/register", async (RegisterRequest request, IAuthService authService, CancellationToken cancellationToken) =>
        {
            var payload = await authService.RegisterAsync(request, cancellationToken);
            return Results.Created("/api/auth/me", new ApiResponse<AuthPayload> { Data = payload });
        });

        group.MapPost("/login", async (LoginRequest request, IAuthService authService, CancellationToken cancellationToken) =>
        {
            var payload = await authService.LoginAsync(request, cancellationToken);
            return Results.Ok(new ApiResponse<AuthPayload> { Data = payload });
        });

        group.MapPost("/refresh", async (RefreshRequest request, IAuthService authService, CancellationToken cancellationToken) =>
        {
            var payload = await authService.RefreshAsync(request, cancellationToken);
            return Results.Ok(new ApiResponse<AuthPayload> { Data = payload });
        });

        group.MapPost("/logout", async (RefreshRequest request, IAuthService authService, CancellationToken cancellationToken) =>
        {
            await authService.LogoutAsync(request, cancellationToken);
            return Results.NoContent();
        });

        group.MapGet("/me", async (ClaimsPrincipal principal, IAuthService authService, CancellationToken cancellationToken) =>
        {
            var userId = Guid.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub")!);
            var user = await authService.GetCurrentUserAsync(userId, cancellationToken);
            return Results.Ok(new ApiResponse<UserResponse> { Data = user });
        }).RequireAuthorization();
    }
}
