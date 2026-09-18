using FinancialAdvisor.Api.Models;

namespace FinancialAdvisor.Api.Services.Auth;

public interface IJwtTokenService
{
    string GenerateToken(User user);
    string GenerateRefreshToken();
    string HashRefreshToken(string refreshToken);
}
