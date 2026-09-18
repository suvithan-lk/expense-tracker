using FinancialAdvisor.Api.DTOs.Auth;

namespace FinancialAdvisor.Api.Services.Auth;

public interface IAuthService
{
    Task<AuthPayload> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<AuthPayload> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<AuthPayload> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken);
    Task LogoutAsync(RefreshRequest request, CancellationToken cancellationToken);
    Task<UserResponse> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken);
}
