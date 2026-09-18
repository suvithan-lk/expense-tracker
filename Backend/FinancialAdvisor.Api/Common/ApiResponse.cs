namespace FinancialAdvisor.Api.Common;

public sealed class ApiResponse<T>
{
    public required T Data { get; init; }
    public string Message { get; init; } = "Success";
}

public sealed class ApiErrorResponse
{
    public required string Message { get; init; }
    public IDictionary<string, string[]>? Errors { get; init; }
}
