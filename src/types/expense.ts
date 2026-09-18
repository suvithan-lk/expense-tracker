export type ExpenseTransaction = {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  amount: number;
  description?: string;
  expenseDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ExpenseInput = {
  amount: number;
  categoryId: string;
  description?: string;
  expenseDate: string;
};

export type ExpenseListData = {
  items: ExpenseTransaction[];
  totalCount: number;
  page: number;
  pageSize: number;
};
