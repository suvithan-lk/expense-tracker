using FinancialAdvisor.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinancialAdvisor.Api.Data.Configurations;

public sealed class IncomeTransactionConfiguration : IEntityTypeConfiguration<IncomeTransaction>
{
    public void Configure(EntityTypeBuilder<IncomeTransaction> builder)
    {
        builder.ToTable("IncomeTransactions");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasDefaultValueSql("gen_random_uuid()");

        builder.Property(t => t.Amount).HasColumnType("numeric(14,2)");
        builder.Property(t => t.Description).HasMaxLength(500);
        builder.Property(t => t.IncomeDate).HasColumnType("date");

        builder.Property(t => t.CreatedAt).HasColumnType("timestamptz");
        builder.Property(t => t.UpdatedAt).HasColumnType("timestamptz");

        builder.HasIndex(t => t.UserId);
        builder.HasIndex(t => t.CategoryId);
        builder.HasIndex(t => new { t.UserId, t.IncomeDate });

        builder.HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.Category)
            .WithMany()
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
