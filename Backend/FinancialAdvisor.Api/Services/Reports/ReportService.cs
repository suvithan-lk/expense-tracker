using System.Globalization;
using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.Data;
using FinancialAdvisor.Api.DTOs.Reports;
using FinancialAdvisor.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FinancialAdvisor.Api.Services.Reports;

public sealed class ReportService(AppDbContext dbContext) : IReportService
{
    public async Task<FinancialReportResponse> GetSummaryAsync(Guid userId, DateOnly from, DateOnly to, Guid? categoryId, CancellationToken cancellationToken)
    {
        if (from > to)
        {
            throw new ValidationAppException(new Dictionary<string, string[]>
            {
                ["to"] = ["'to' must be on or after 'from'."],
            });
        }

        var totalIncome = await dbContext.IncomeTransactions
            .Where(t => t.UserId == userId && t.IncomeDate >= from && t.IncomeDate <= to)
            .SumAsync(t => t.Amount, cancellationToken);

        var expenseQuery = dbContext.ExpenseTransactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && t.ExpenseDate >= from && t.ExpenseDate <= to);

        if (categoryId is { } filterId)
        {
            expenseQuery = expenseQuery.Where(t => t.CategoryId == filterId);
        }

        var totalExpenses = await expenseQuery.SumAsync(t => t.Amount, cancellationToken);
        var expenseBreakdown = await BuildBreakdownAsync(expenseQuery, totalExpenses, cancellationToken);

        var incomeQuery = dbContext.IncomeTransactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && t.IncomeDate >= from && t.IncomeDate <= to);
        var incomeBreakdown = await BuildIncomeBreakdownAsync(incomeQuery, totalIncome, cancellationToken);

        var netBalance = totalIncome - totalExpenses;
        var savingsRate = totalIncome > 0 ? Math.Round(netBalance / totalIncome * 100m, 2) : 0m;
        var highestExpenseCategory = expenseBreakdown.OrderByDescending(b => b.Amount).FirstOrDefault();

        var budgetPerformance = await BuildBudgetPerformanceAsync(userId, from, to, cancellationToken);

        var (previousFrom, previousTo) = PreviousRange(from, to);
        var previousIncome = await dbContext.IncomeTransactions
            .Where(t => t.UserId == userId && t.IncomeDate >= previousFrom && t.IncomeDate <= previousTo)
            .SumAsync(t => t.Amount, cancellationToken);

        var previousExpenseQuery = dbContext.ExpenseTransactions
            .Where(t => t.UserId == userId && t.ExpenseDate >= previousFrom && t.ExpenseDate <= previousTo);
        if (categoryId is { } previousFilterId)
        {
            previousExpenseQuery = previousExpenseQuery.Where(t => t.CategoryId == previousFilterId);
        }

        var previousExpenses = await previousExpenseQuery.SumAsync(t => t.Amount, cancellationToken);
        var previousBalance = previousIncome - previousExpenses;

        var comparison = new ReportComparisonResponse(
            PeriodLabel(previousFrom, previousTo),
            PercentageChange(totalIncome, previousIncome),
            PercentageChange(totalExpenses, previousExpenses),
            PercentageChange(netBalance, previousBalance));

        return new FinancialReportResponse(
            PeriodLabel(from, to),
            totalIncome,
            totalExpenses,
            netBalance,
            netBalance,
            savingsRate,
            highestExpenseCategory,
            incomeBreakdown,
            expenseBreakdown,
            budgetPerformance,
            comparison);
    }

    private static async Task<List<ReportBreakdownResponse>> BuildBreakdownAsync(
        IQueryable<ExpenseTransaction> expenseQuery,
        decimal total,
        CancellationToken cancellationToken)
    {
        var grouped = await expenseQuery
            .GroupBy(t => new { t.CategoryId, t.Category.Name })
            .Select(g => new { g.Key.CategoryId, g.Key.Name, Amount = g.Sum(t => t.Amount) })
            .ToListAsync(cancellationToken);

        return grouped
            .OrderByDescending(g => g.Amount)
            .Select(g => new ReportBreakdownResponse(
                g.CategoryId,
                g.Name,
                g.Amount,
                total > 0 ? Math.Round(g.Amount / total * 100m, 2) : 0m))
            .ToList();
    }

    private static async Task<List<ReportBreakdownResponse>> BuildIncomeBreakdownAsync(
        IQueryable<IncomeTransaction> incomeQuery,
        decimal total,
        CancellationToken cancellationToken)
    {
        var grouped = await incomeQuery
            .GroupBy(t => new { t.CategoryId, t.Category.Name })
            .Select(g => new { g.Key.CategoryId, g.Key.Name, Amount = g.Sum(t => t.Amount) })
            .ToListAsync(cancellationToken);

        return grouped
            .OrderByDescending(g => g.Amount)
            .Select(g => new ReportBreakdownResponse(
                g.CategoryId,
                g.Name,
                g.Amount,
                total > 0 ? Math.Round(g.Amount / total * 100m, 2) : 0m))
            .ToList();
    }

    private async Task<List<ReportBudgetPerformanceResponse>> BuildBudgetPerformanceAsync(
        Guid userId,
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken)
    {
        var budgets = await dbContext.Budgets
            .Include(b => b.Category)
            .Where(b => b.UserId == userId)
            .ToListAsync(cancellationToken);

        var overlapping = budgets.Where(b =>
        {
            var monthStart = new DateOnly(b.Year, b.Month, 1);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);
            return monthStart <= to && monthEnd >= from;
        }).ToList();

        var results = new List<ReportBudgetPerformanceResponse>();

        foreach (var budget in overlapping)
        {
            var monthStart = new DateOnly(budget.Year, budget.Month, 1);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);

            var spentQuery = dbContext.ExpenseTransactions
                .Where(t => t.UserId == userId && t.ExpenseDate >= monthStart && t.ExpenseDate <= monthEnd);

            if (budget.CategoryId is { } cid)
            {
                spentQuery = spentQuery.Where(t => t.CategoryId == cid);
            }

            var spent = await spentQuery.SumAsync(t => t.Amount, cancellationToken);
            var usagePercentage = budget.Amount > 0 ? Math.Round(spent / budget.Amount * 100m, 2) : 0m;

            results.Add(new ReportBudgetPerformanceResponse(
                budget.Id,
                budget.Category?.Name ?? "All expenses",
                budget.Amount,
                spent,
                usagePercentage));
        }

        return results;
    }

    private static (DateOnly From, DateOnly To) PreviousRange(DateOnly from, DateOnly to)
    {
        var isFullMonth = from.Day == 1 && to == from.AddMonths(1).AddDays(-1);

        if (isFullMonth)
        {
            var previousStart = from.AddMonths(-1);
            return (previousStart, from.AddDays(-1));
        }

        var lengthInDays = to.DayNumber - from.DayNumber + 1;
        var previousTo = from.AddDays(-1);
        var previousFrom = previousTo.AddDays(-(lengthInDays - 1));
        return (previousFrom, previousTo);
    }

    private static decimal PercentageChange(decimal current, decimal previous)
    {
        if (previous == 0)
        {
            return current == 0 ? 0m : 100m;
        }

        return Math.Round((current - previous) / Math.Abs(previous) * 100m, 2);
    }

    private static string PeriodLabel(DateOnly from, DateOnly to)
    {
        var isFullMonth = from.Day == 1
            && from.Month == to.Month
            && from.Year == to.Year
            && to == from.AddMonths(1).AddDays(-1);

        return isFullMonth
            ? from.ToString("MMMM yyyy", CultureInfo.InvariantCulture)
            : $"{from:d MMM yyyy} – {to:d MMM yyyy}";
    }
}
