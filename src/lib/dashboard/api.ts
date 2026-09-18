import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/auth";
import type { DashboardQuery, DashboardSummary } from "@/types/dashboard";

export function getDashboardSummary(query: DashboardQuery) {
  const params = new URLSearchParams({ period: query.period });
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);

  return apiClient.get<ApiResponse<DashboardSummary>>(`/api/dashboard/summary?${params.toString()}`);
}
