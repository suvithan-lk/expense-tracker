using System.Net;
using System.Text.Json;
using FinancialAdvisor.Api.Common;

namespace FinancialAdvisor.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger,
    IHostEnvironment environment)
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            var (statusCode, response) = MapException(ex, environment.IsDevelopment());

            if (statusCode == HttpStatusCode.InternalServerError)
            {
                logger.LogError(ex, "Unhandled exception while processing {Method} {Path}", context.Request.Method, context.Request.Path);
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;
            await context.Response.WriteAsync(JsonSerializer.Serialize(response, SerializerOptions));
        }
    }

    private static (HttpStatusCode StatusCode, ApiErrorResponse Response) MapException(Exception ex, bool isDevelopment)
    {
        return ex switch
        {
            ValidationAppException validation => (
                HttpStatusCode.BadRequest,
                new ApiErrorResponse { Message = "Validation failed", Errors = validation.Errors }),
            ConflictAppException conflict => (
                HttpStatusCode.Conflict,
                new ApiErrorResponse { Message = conflict.Message }),
            UnauthorizedAppException unauthorized => (
                HttpStatusCode.Unauthorized,
                new ApiErrorResponse { Message = unauthorized.Message }),
            NotFoundAppException notFound => (
                HttpStatusCode.NotFound,
                new ApiErrorResponse { Message = notFound.Message }),
            _ => (
                HttpStatusCode.InternalServerError,
                new ApiErrorResponse
                {
                    Message = isDevelopment ? ex.Message : "An unexpected error occurred. Please try again later.",
                }),
        };
    }
}
