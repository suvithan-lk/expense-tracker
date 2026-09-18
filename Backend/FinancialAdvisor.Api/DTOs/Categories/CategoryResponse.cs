namespace FinancialAdvisor.Api.DTOs.Categories;

public sealed record CategoryResponse(Guid Id, string Name, string Type, DateTime CreatedAt, DateTime UpdatedAt);
