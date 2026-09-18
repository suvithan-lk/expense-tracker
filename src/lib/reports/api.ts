import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/auth";
import type { FinancialReport, ReportQuery } from "@/types/report";

export function getFinancialReport(query: ReportQuery) {
  const params = new URLSearchParams({ from: query.from, to: query.to });
  if (query.categoryId) params.set("categoryId", query.categoryId);
  return apiClient.get<ApiResponse<FinancialReport>>(`/api/reports/summary?${params.toString()}`);
}
