using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.DTOs.Expenses;

namespace FinancialAdvisor.Api.Services.Expenses;

public interface IExpenseService
{
    Task<PagedResult<ExpenseTransactionResponse>> ListAsync(Guid userId, ExpenseListQuery query, CancellationToken cancellationToken);
    Task<ExpenseTransactionResponse> GetAsync(Guid userId, Guid id, CancellationToken cancellationToken);
    Task<ExpenseTransactionResponse> CreateAsync(Guid userId, ExpenseRequest request, CancellationToken cancellationToken);
    Task<ExpenseTransactionResponse> UpdateAsync(Guid userId, Guid id, ExpenseRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid userId, Guid id, CancellationToken cancellationToken);
}
