export type ReportQuery = {
  from: string;
  to: string;
  categoryId?: string;
};

export type ReportBreakdown = {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
};

export type ReportBudgetPerformance = {
  id: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  usagePercentage: number;
};

export type ReportComparison = {
  previousPeriodLabel: string;
  incomeChangePercentage: number;
  expenseChangePercentage: number;
  balanceChangePercentage: number;
};

export type FinancialReport = {
  periodLabel: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savings: number;
  savingsRate: number;
  highestExpenseCategory?: ReportBreakdown;
  incomeBreakdown: ReportBreakdown[];
  expenseBreakdown: ReportBreakdown[];
  budgetPerformance: ReportBudgetPerformance[];
  comparison?: ReportComparison;
};
