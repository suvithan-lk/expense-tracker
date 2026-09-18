export type IncomeTransaction = {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  amount: number;
  description?: string;
  incomeDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export type IncomeInput = {
  amount: number;
  categoryId: string;
  description?: string;
  incomeDate: string;
};

export type IncomeListData = {
  items: IncomeTransaction[];
  totalCount: number;
  page: number;
  pageSize: number;
};
