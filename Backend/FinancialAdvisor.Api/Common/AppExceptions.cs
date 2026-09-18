namespace FinancialAdvisor.Api.Common;

public sealed class ValidationAppException(IDictionary<string, string[]> errors)
    : Exception("Validation failed.")
{
    public IDictionary<string, string[]> Errors { get; } = errors;
}

public sealed class ConflictAppException(string message) : Exception(message);

public sealed class UnauthorizedAppException(string message) : Exception(message);

public sealed class NotFoundAppException(string message) : Exception(message);
