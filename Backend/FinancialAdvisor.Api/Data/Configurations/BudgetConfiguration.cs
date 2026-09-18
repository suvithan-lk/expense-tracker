using FinancialAdvisor.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinancialAdvisor.Api.Data.Configurations;

public sealed class BudgetConfiguration : IEntityTypeConfiguration<Budget>
{
    public void Configure(EntityTypeBuilder<Budget> builder)
    {
        builder.ToTable("Budgets");

        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).HasDefaultValueSql("gen_random_uuid()");

        builder.Property(b => b.Amount).HasColumnType("numeric(14,2)");

        builder.Property(b => b.CreatedAt).HasColumnType("timestamptz");
        builder.Property(b => b.UpdatedAt).HasColumnType("timestamptz");

        builder.HasIndex(b => b.UserId);

        builder.HasIndex(b => new { b.UserId, b.CategoryId, b.Month, b.Year })
            .IsUnique()
            .HasFilter("\"CategoryId\" IS NOT NULL")
            .HasDatabaseName("IX_Budgets_UserId_CategoryId_Month_Year_Unique");

        builder.HasIndex(b => new { b.UserId, b.Month, b.Year })
            .IsUnique()
            .HasFilter("\"CategoryId\" IS NULL")
            .HasDatabaseName("IX_Budgets_UserId_Month_Year_NoCategory_Unique");

        builder.HasOne(b => b.User)
            .WithMany()
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(b => b.Category)
            .WithMany()
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
