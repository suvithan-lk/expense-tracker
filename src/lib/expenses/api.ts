import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/auth";
import type { ExpenseInput, ExpenseListData, ExpenseTransaction } from "@/types/expense";

export function listExpenses(query: string) {
  return apiClient.get<ApiResponse<ExpenseListData>>(`/api/expenses?${query}`);
}

export function createExpense(input: ExpenseInput) {
  return apiClient.post<ApiResponse<ExpenseTransaction>>("/api/expenses", input);
}

export function updateExpense(id: string, input: ExpenseInput) {
  return apiClient.put<ApiResponse<ExpenseTransaction>>(`/api/expenses/${id}`, input);
}

export function deleteExpense(id: string) {
  return apiClient.delete<void>(`/api/expenses/${id}`);
}
