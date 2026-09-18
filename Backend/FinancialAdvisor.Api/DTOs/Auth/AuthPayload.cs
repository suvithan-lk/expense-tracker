namespace FinancialAdvisor.Api.DTOs.Auth;

public sealed record AuthPayload(string Token, string RefreshToken, UserResponse User);
