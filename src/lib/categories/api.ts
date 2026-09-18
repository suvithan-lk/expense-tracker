import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/auth";
import type { Category, CategoryType } from "@/types/category";

export type CategoryInput = {
  name: string;
  type: CategoryType;
};

export function listCategories(type: CategoryType) {
  return apiClient.get<ApiResponse<Category[]>>(`/api/categories?type=${type}`);
}

export function createCategory(input: CategoryInput) {
  return apiClient.post<ApiResponse<Category>>("/api/categories", input);
}

export function updateCategory(id: string, input: Pick<CategoryInput, "name">) {
  return apiClient.put<ApiResponse<Category>>(`/api/categories/${id}`, input);
}

export function deleteCategory(id: string) {
  return apiClient.delete<void>(`/api/categories/${id}`);
}
