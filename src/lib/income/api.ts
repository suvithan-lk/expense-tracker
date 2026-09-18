import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/auth";
import type { IncomeInput, IncomeListData, IncomeTransaction } from "@/types/income";

export function listIncome(query: string) {
  return apiClient.get<ApiResponse<IncomeListData>>(`/api/income?${query}`);
}

export function createIncome(input: IncomeInput) {
  return apiClient.post<ApiResponse<IncomeTransaction>>("/api/income", input);
}

export function updateIncome(id: string, input: IncomeInput) {
  return apiClient.put<ApiResponse<IncomeTransaction>>(`/api/income/${id}`, input);
}

export function deleteIncome(id: string) {
  return apiClient.delete<void>(`/api/income/${id}`);
}
