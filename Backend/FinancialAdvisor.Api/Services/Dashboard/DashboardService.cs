using System.Globalization;
using FinancialAdvisor.Api.Common;
using FinancialAdvisor.Api.Data;
using FinancialAdvisor.Api.DTOs.Dashboard;
using Microsoft.EntityFrameworkCore;

namespace FinancialAdvisor.Api.Services.Dashboard;

public sealed class DashboardService(AppDbContext dbContext) : IDashboardService
{
    private const int RecentActivityLimit = 8;

    public async Task<DashboardSummaryResponse> GetSummaryAsync(Guid userId, string period, DateOnly? from, DateOnly? to, CancellationToken cancellationToken)
    {
        var (start, end) = ResolveRange(period, from, to);
        var (previousStart, previousEnd) = ResolvePreviousRange(period, start, end);

        var incomeQuery = dbContext.IncomeTransactions
            .Where(t => t.UserId == userId && t.IncomeDate >= start && t.IncomeDate <= end);

        var expenseQuery = dbContext.ExpenseTransactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && t.ExpenseDate >= start && t.ExpenseDate <= end);

        var previousExpenseQuery = dbContext.ExpenseTransactions
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && t.ExpenseDate >= previousStart && t.ExpenseDate <= previousEnd);

        var totalIncome = await incomeQuery.SumAsync(t => t.Amount, cancellationToken);
        var incomeCount = await incomeQuery.CountAsync(cancellationToken);

        var totalExpenses = await expenseQuery.SumAsync(t => t.Amount, cancellationToken);
        var expenseCount = await expenseQuery.CountAsync(cancellationToken);

        var expenseByCategory = await BuildCategoryBreakdownAsync(expenseQuery, totalExpenses, cancellationToken);

        var previousTotalExpenses = await previousExpenseQuery.SumAsync(t => t.Amount, cancellationToken);
        var previousExpenseByCategory = await BuildCategoryBreakdownAsync(previousExpenseQuery, previousTotalExpenses, cancellationToken);

        var balance = totalIncome - totalExpenses;
        var savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100m : 0m;

        var cashFlow = await BuildCashFlowAsync(incomeQuery, expenseQuery, start, end, cancellationToken);
        var recentActivity = await BuildRecentActivityAsync(incomeQuery, expenseQuery, cancellationToken);

        return new DashboardSummaryResponse(
            TotalIncome: totalIncome,
            TotalExpenses: totalExpenses,
            Balance: balance,
            Savings: balance,
            SavingsRate: savingsRate,
            IncomeCount: incomeCount,
            ExpenseCount: expenseCount,
            PreviousTotalExpenses: previousTotalExpenses,
            PreviousExpenseByCategory: previousExpenseByCategory,
            ExpenseByCategory: expenseByCategory,
            BudgetUsage: null,
            CashFlow: cashFlow,
            RecentActivity: recentActivity);
    }

    private static (DateOnly Start, DateOnly End) ResolveRange(string period, DateOnly? from, DateOnly? to)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        switch (period.ToLowerInvariant())
        {
            case "currentmonth":
            {
                var start = new DateOnly(today.Year, today.Month, 1);
                return (start, start.AddMonths(1).AddDays(-1));
            }
            case "previousmonth":
            {
                var firstOfCurrent = new DateOnly(today.Year, today.Month, 1);
                var start = firstOfCurrent.AddMonths(-1);
                return (start, firstOfCurrent.AddDays(-1));
            }
            case "custom":
            {
                if (from is null || to is null || from > to)
                {
                    throw new ValidationAppException(new Dictionary<string, string[]>
                    {
                        ["period"] = ["Custom periods require a valid 'from' and 'to' date, with 'from' on or before 'to'."],
                    });
                }

                return (from.Value, to.Value);
            }
            default:
                throw new ValidationAppException(new Dictionary<string, string[]>
                {
                    ["period"] = ["Period must be 'currentMonth', 'previousMonth', or 'custom'."],
                });
        }
    }

    private static (DateOnly Start, DateOnly End) ResolvePreviousRange(string period, DateOnly start, DateOnly end)
    {
        if (string.Equals(period, "custom", StringComparison.OrdinalIgnoreCase))
        {
            var lengthInDays = end.DayNumber - start.DayNumber + 1;
            var previousEnd = start.AddDays(-1);
            var previousStart = previousEnd.AddDays(-(lengthInDays - 1));
            return (previousStart, previousEnd);
        }

        return (start.AddMonths(-1), start.AddDays(-1));
    }

    private static async Task<IReadOnlyList<DashboardCategoryDto>> BuildCategoryBreakdownAsync(
        IQueryable<Models.ExpenseTransaction> expenseQuery,
        decimal totalExpenses,
        CancellationToken cancellationToken)
    {
        var grouped = await expenseQuery
            .GroupBy(t => new { t.CategoryId, t.Category.Name })
            .Select(g => new { g.Key.CategoryId, g.Key.Name, Amount = g.Sum(t => t.Amount) })
            .ToListAsync(cancellationToken);

        return grouped
            .OrderByDescending(g => g.Amount)
            .Select(g => new DashboardCategoryDto(
                g.CategoryId,
                g.Name,
                g.Amount,
                totalExpenses > 0 ? Math.Round(g.Amount / totalExpenses * 100m, 2) : 0m))
            .ToList();
    }

    private static async Task<IReadOnlyList<DashboardCashFlowPoint>> BuildCashFlowAsync(
        IQueryable<Models.IncomeTransaction> incomeQuery,
        IQueryable<Models.ExpenseTransaction> expenseQuery,
        DateOnly start,
        DateOnly end,
        CancellationToken cancellationToken)
    {
        var dailyIncome = await incomeQuery
            .GroupBy(t => t.IncomeDate)
            .Select(g => new { Date = g.Key, Total = g.Sum(t => t.Amount) })
            .ToDictionaryAsync(g => g.Date, g => g.Total, cancellationToken);

        var dailyExpenses = await expenseQuery
            .GroupBy(t => t.ExpenseDate)
            .Select(g => new { Date = g.Key, Total = g.Sum(t => t.Amount) })
            .ToDictionaryAsync(g => g.Date, g => g.Total, cancellationToken);

        var points = new List<DashboardCashFlowPoint>();
        for (var day = start; day <= end; day = day.AddDays(1))
        {
            points.Add(new DashboardCashFlowPoint(
                day.ToString("dd MMM", CultureInfo.InvariantCulture),
                dailyIncome.GetValueOrDefault(day),
                dailyExpenses.GetValueOrDefault(day)));
        }

        return points;
    }

    private async Task<IReadOnlyList<DashboardActivity>> BuildRecentActivityAsync(
        IQueryable<Models.IncomeTransaction> incomeQuery,
        IQueryable<Models.ExpenseTransaction> expenseQuery,
        CancellationToken cancellationToken)
    {
        var recentIncome = await incomeQuery
            .Include(t => t.Category)
            .OrderByDescending(t => t.IncomeDate)
            .ThenByDescending(t => t.CreatedAt)
            .Take(RecentActivityLimit)
            .Select(t => new
            {
                t.Id,
                Type = "income",
                Label = t.Description,
                CategoryName = t.Category.Name,
                t.Amount,
                Date = t.IncomeDate,
                t.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        var recentExpense = await expenseQuery
            .OrderByDescending(t => t.ExpenseDate)
            .ThenByDescending(t => t.CreatedAt)
            .Take(RecentActivityLimit)
            .Select(t => new
            {
                t.Id,
                Type = "expense",
                Label = t.Description,
                CategoryName = t.Category.Name,
                t.Amount,
                Date = t.ExpenseDate,
                t.CreatedAt,
            })
            .ToListAsync(cancellationToken);

        return recentIncome.Concat(recentExpense)
            .OrderByDescending(a => a.Date)
            .ThenByDescending(a => a.CreatedAt)
            .Take(RecentActivityLimit)
            .Select(a => new DashboardActivity(
                a.Id,
                a.Type,
                string.IsNullOrWhiteSpace(a.Label) ? a.CategoryName : a.Label,
                a.CategoryName,
                a.Amount,
                a.Date))
            .ToList();
    }
}
