using FinancialAdvisor.Api.DTOs.Categories;
using FinancialAdvisor.Api.Models;

namespace FinancialAdvisor.Api.Services.Categories;

public interface ICategoryService
{
    IReadOnlyList<Category> BuildDefaultCategories(Guid userId, DateTime timestamp);

    Task<IReadOnlyList<CategoryResponse>> ListAsync(Guid userId, CategoryType type, CancellationToken cancellationToken);

    Task<CategoryResponse> CreateAsync(Guid userId, CreateCategoryRequest request, CancellationToken cancellationToken);

    Task<CategoryResponse> RenameAsync(Guid userId, Guid categoryId, RenameCategoryRequest request, CancellationToken cancellationToken);

    Task DeleteAsync(Guid userId, Guid categoryId, CancellationToken cancellationToken);
}
