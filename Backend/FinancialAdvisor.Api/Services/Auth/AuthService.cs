using System.Text.RegularExpressions;
using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.Data;
using FinancialAdvisor.Api.DTOs.Auth;
using FinancialAdvisor.Api.Models;
using FinancialAdvisor.Api.Services.Categories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FinancialAdvisor.Api.Services.Auth;

public sealed partial class AuthService(
    AppDbContext dbContext,
    IPasswordHasherService passwordHasher,
    IJwtTokenService jwtTokenService,
    ICategoryService categoryService,
    IOptions<JwtOptions> jwtOptions) : IAuthService
{
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;

    private const int MinPasswordLength = 8;
    private const int MaxNameLength = 100;

    public async Task<AuthPayload> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            errors["name"] = ["Name is required."];
        }
        else if (request.Name.Length > MaxNameLength)
        {
            errors["name"] = [$"Name must be at most {MaxNameLength} characters."];
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(request.Email) || !EmailRegex().IsMatch(request.Email))
        {
            errors["email"] = ["A valid email address is required."];
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < MinPasswordLength)
        {
            errors["password"] = [$"Password must be at least {MinPasswordLength} characters."];
        }

        if (errors.Count > 0)
        {
            throw new ValidationAppException(errors);
        }

        var emailExists = await dbContext.Users
            .AnyAsync(u => u.NormalizedEmail == normalizedEmail, cancellationToken);

        if (emailExists)
        {
            throw new ConflictAppException("An account with this email already exists.");
        }

        var now = DateTime.UtcNow;
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Email = request.Email.Trim(),
            NormalizedEmail = normalizedEmail,
            PasswordHash = passwordHasher.Hash(request.Password),
            CreatedAt = now,
            UpdatedAt = now,
        };

        dbContext.Users.Add(user);
        dbContext.Categories.AddRange(categoryService.BuildDefaultCategories(user.Id, now));
        await dbContext.SaveChangesAsync(cancellationToken);

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthPayload> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            throw new UnauthorizedAppException("Invalid email or password.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail, cancellationToken);

        if (user is null || !passwordHasher.Verify(user.PasswordHash, request.Password))
        {
            throw new UnauthorizedAppException("Invalid email or password.");
        }

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthPayload> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            throw new UnauthorizedAppException("Invalid or expired refresh token.");
        }

        var tokenHash = jwtTokenService.HashRefreshToken(request.RefreshToken);
        var now = DateTime.UtcNow;

        var storedToken = await dbContext.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

        if (storedToken is null || storedToken.RevokedAt is not null || storedToken.ExpiresAt <= now)
        {
            throw new UnauthorizedAppException("Invalid or expired refresh token.");
        }

        storedToken.RevokedAt = now;

        return await IssueTokensAsync(storedToken.User, cancellationToken);
    }

    public async Task LogoutAsync(RefreshRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return;
        }

        var tokenHash = jwtTokenService.HashRefreshToken(request.RefreshToken);
        var storedToken = await dbContext.RefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

        if (storedToken is null || storedToken.RevokedAt is not null)
        {
            return;
        }

        storedToken.RevokedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<AuthPayload> IssueTokensAsync(User user, CancellationToken cancellationToken)
    {
        var accessToken = jwtTokenService.GenerateToken(user);
        var refreshToken = jwtTokenService.GenerateRefreshToken();
        var now = DateTime.UtcNow;

        dbContext.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = jwtTokenService.HashRefreshToken(refreshToken),
            ExpiresAt = now.AddDays(_jwtOptions.RefreshTokenExpiryDays),
            CreatedAt = now,
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return new AuthPayload(accessToken, refreshToken, new UserResponse(user.Id, user.Name, user.Email));
    }

    public async Task<UserResponse> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new NotFoundAppException("User not found.");

        return new UserResponse(user.Id, user.Name, user.Email);
    }

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
    private static partial Regex EmailRegex();
}
