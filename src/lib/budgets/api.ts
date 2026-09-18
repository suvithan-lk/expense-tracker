import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/auth";
import type { Budget, BudgetInput, BudgetListData } from "@/types/budget";

export function listBudgets(month: number, year: number, categoryId?: string) {
  const params = new URLSearchParams({ month: String(month), year: String(year) });
  if (categoryId) params.set("categoryId", categoryId);
  return apiClient.get<ApiResponse<BudgetListData>>(`/api/budgets?${params.toString()}`);
}

export function createBudget(input: BudgetInput) {
  return apiClient.post<ApiResponse<Budget>>("/api/budgets", input);
}

export function updateBudget(id: string, input: BudgetInput) {
  return apiClient.put<ApiResponse<Budget>>(`/api/budgets/${id}`, input);
}

export function deleteBudget(id: string) {
  return apiClient.delete<void>(`/api/budgets/${id}`);
}
