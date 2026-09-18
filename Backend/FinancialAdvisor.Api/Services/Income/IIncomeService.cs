using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.DTOs.Income;

namespace FinancialAdvisor.Api.Services.Income;

public interface IIncomeService
{
    Task<PagedResult<IncomeTransactionResponse>> ListAsync(Guid userId, IncomeListQuery query, CancellationToken cancellationToken);
    Task<IncomeTransactionResponse> GetAsync(Guid userId, Guid id, CancellationToken cancellationToken);
    Task<IncomeTransactionResponse> CreateAsync(Guid userId, IncomeRequest request, CancellationToken cancellationToken);
    Task<IncomeTransactionResponse> UpdateAsync(Guid userId, Guid id, IncomeRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid userId, Guid id, CancellationToken cancellationToken);
}
