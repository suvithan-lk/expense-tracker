using System.Text;
using System.Text.Json;
using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.Data;
using FinancialAdvisor.Api.Features.Auth;
using FinancialAdvisor.Api.Features.Budgets;
using FinancialAdvisor.Api.Features.Categories;
using FinancialAdvisor.Api.Features.Dashboard;
using FinancialAdvisor.Api.Features.Expenses;
using FinancialAdvisor.Api.Features.Income;
using FinancialAdvisor.Api.Features.Reports;
using FinancialAdvisor.Api.Middleware;
using FinancialAdvisor.Api.Services.Auth;
using FinancialAdvisor.Api.Services.Budgets;
using FinancialAdvisor.Api.Services.Categories;
using FinancialAdvisor.Api.Services.Dashboard;
using FinancialAdvisor.Api.Services.Expenses;
using FinancialAdvisor.Api.Services.Income;
using FinancialAdvisor.Api.Services.Reports;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName));

builder.Services
    .AddOptions<CorsOptions>()
    .Bind(builder.Configuration.GetSection(CorsOptions.SectionName));

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
var corsOptions = builder.Configuration.GetSection(CorsOptions.SectionName).Get<CorsOptions>() ?? new CorsOptions();
// Fail fast when JWT signing key is not configured to avoid runtime exceptions
if (string.IsNullOrWhiteSpace(jwtOptions.Key))
{
    throw new InvalidOperationException("JWT signing key is not configured. Set configuration section 'Jwt:Key' (use appsettings, environment variable, or user secrets).");
}
const string FrontendCorsPolicy = "FrontendCorsPolicy";

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        if (corsOptions.AllowedOrigins.Length > 0)
        {
            policy.WithOrigins(corsOptions.AllowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseNpgsql(connectionString);
});

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
        };

        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";
                var body = new ApiErrorResponse { Message = "Authentication is required to access this resource." };
                await context.Response.WriteAsync(JsonSerializer.Serialize(body, new JsonSerializerOptions(JsonSerializerDefaults.Web)));
            },
            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                var body = new ApiErrorResponse { Message = "You do not have permission to access this resource." };
                await context.Response.WriteAsync(JsonSerializer.Serialize(body, new JsonSerializerOptions(JsonSerializerDefaults.Web)));
            },
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<IPasswordHasherService, PasswordHasherService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IIncomeService, IncomeService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IBudgetService, BudgetService>();
builder.Services.AddScoped<IReportService, ReportService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new ApiResponse<object>
{
    Data = new { status = "healthy" },
    Message = "Success",
}));

app.MapAuthEndpoints();
app.MapCategoryEndpoints();
app.MapIncomeEndpoints();
app.MapExpenseEndpoints();
app.MapDashboardEndpoints();
app.MapBudgetEndpoints();
app.MapReportEndpoints();

app.Run();
