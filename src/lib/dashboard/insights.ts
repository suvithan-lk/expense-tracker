import type { DashboardSummary, FinancialInsight } from "@/types/dashboard";

export function calculateSavingsRate(totalIncome: number, totalExpenses: number) {
  if (totalIncome <= 0) {
    return 0;
  }

  return ((totalIncome - totalExpenses) / totalIncome) * 100;
}

export function buildInsights(summary: DashboardSummary, period: string): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  if (summary.totalExpenses > summary.totalIncome) {
    insights.push({
      type: "warning",
      title: "Expenses are above income",
      description: "Your expenses are higher than your income for this period.",
      period,
    });
  }

  if (summary.totalIncome > 0 && summary.savingsRate < 10) {
    insights.push({
      type: "info",
      title: "Your savings rate is low",
      description: "Your current savings rate is below 10% for this period.",
      period,
    });
  }

  const previousCategories = new Map((summary.previousExpenseByCategory ?? []).map((category) => [category.categoryId, category]));
  const increasedCategory = summary.expenseByCategory.find((category) => {
    const previous = previousCategories.get(category.categoryId);
    return previous && previous.amount > 0 && category.amount >= previous.amount * 1.2;
  });

  if (increasedCategory) {
    const previous = previousCategories.get(increasedCategory.categoryId);
    const increase = previous ? Math.round(((increasedCategory.amount - previous.amount) / previous.amount) * 100) : 0;
    insights.push({
      type: "warning",
      title: `${increasedCategory.categoryName} spending increased`,
      description: `Spending in this category increased by ${increase}% compared with the previous period.`,
      period,
      categoryName: increasedCategory.categoryName,
    });
  }

  const exceededBudget = (summary.budgetUsage ?? []).find((budget) => budget.usagePercentage > 100);
  if (exceededBudget) {
    insights.push({
      type: "warning",
      title: "A budget has been exceeded",
      description: `Your ${exceededBudget.categoryName} budget is over 100% used for this period.`,
      period,
      categoryName: exceededBudget.categoryName,
    });
  }

  if (summary.previousTotalExpenses !== undefined && summary.previousTotalExpenses > 0 && summary.totalExpenses < summary.previousTotalExpenses * 0.9) {
    insights.push({
      type: "positive",
      title: "Your expenses decreased",
      description: "Your total expenses decreased by at least 10% compared with the previous period.",
      period,
    });
  }

  if (insights.length === 0 && summary.totalIncome > 0 && summary.savingsRate >= 20) {
    insights.push({
      type: "positive",
      title: "Your saving rhythm is strong",
      description: "Your savings rate is above 20% for this period.",
      period,
    });
  }

  if (summary.totalIncome === 0 && summary.totalExpenses === 0) {
    insights.push({
      type: "info",
      title: "No activity in this period",
      description: "Add income or expenses to start building a useful financial picture.",
      period,
    });
  }

  return insights;
}
