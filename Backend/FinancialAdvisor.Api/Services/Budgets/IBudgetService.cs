using FinancialAdvisor.Api.DTOs.Budgets;

namespace FinancialAdvisor.Api.Services.Budgets;

public interface IBudgetService
{
    Task<BudgetListResponse> ListAsync(Guid userId, int month, int year, Guid? categoryId, CancellationToken cancellationToken);

    Task<BudgetResponse> CreateAsync(Guid userId, BudgetRequest request, CancellationToken cancellationToken);

    Task<BudgetResponse> UpdateAsync(Guid userId, Guid id, BudgetRequest request, CancellationToken cancellationToken);

    Task DeleteAsync(Guid userId, Guid id, CancellationToken cancellationToken);
}
