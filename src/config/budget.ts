export const budgetThresholds = {
  normal: 70,
  warning: 90,
  exceeded: 100,
} as const;

export type BudgetStatus = "normal" | "warning" | "high" | "exceeded";

export function getBudgetStatus(usagePercentage: number): BudgetStatus {
  if (usagePercentage > budgetThresholds.exceeded) return "exceeded";
  if (usagePercentage > budgetThresholds.warning) return "high";
  if (usagePercentage >= budgetThresholds.normal) return "warning";
  return "normal";
}
