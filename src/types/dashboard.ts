export type DashboardPeriod = "currentMonth" | "previousMonth" | "custom";

export type DashboardQuery = {
  period: DashboardPeriod;
  from?: string;
  to?: string;
};

export type DashboardCategory = {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
};

export type DashboardBudgetUsage = {
  id: string;
  categoryName: string;
  usagePercentage: number;
};

export type DashboardCashFlowPoint = {
  label: string;
  income: number;
  expenses: number;
};

export type DashboardActivity = {
  id: string;
  type: "income" | "expense";
  label: string;
  categoryName: string;
  amount: number;
  date: string;
};

export type DashboardSummary = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savings: number;
  savingsRate: number;
  incomeCount: number;
  expenseCount: number;
  previousTotalExpenses?: number;
  previousExpenseByCategory?: DashboardCategory[];
  expenseByCategory: DashboardCategory[];
  budgetUsage?: DashboardBudgetUsage[];
  cashFlow: DashboardCashFlowPoint[];
  recentActivity: DashboardActivity[];
};

export type FinancialInsight = {
  type: "warning" | "positive" | "info";
  title: string;
  description: string;
  period: string;
  categoryName?: string;
};
