namespace FinancialAdvisor.Api.Services.Auth;

public interface IPasswordHasherService
{
    string Hash(string password);
    bool Verify(string passwordHash, string providedPassword);
}
