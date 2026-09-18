export type Budget = {
  id: string;
  userId: string;
  categoryId?: string;
  categoryName?: string;
  amount: number;
  spentAmount: number;
  remainingAmount: number;
  usagePercentage: number;
  month: number;
  year: number;
  createdAt?: string;
  updatedAt?: string;
};

export type BudgetInput = {
  amount: number;
  categoryId?: string;
  month: number;
  year: number;
};

export type BudgetListData = {
  items: Budget[];
  totalCount: number;
};
