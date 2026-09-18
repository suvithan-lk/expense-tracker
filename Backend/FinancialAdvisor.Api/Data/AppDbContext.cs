using FinancialAdvisor.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FinancialAdvisor.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<IncomeTransaction> IncomeTransactions => Set<IncomeTransaction>();
    public DbSet<ExpenseTransaction> ExpenseTransactions => Set<ExpenseTransaction>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
