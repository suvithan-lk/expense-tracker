import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  trend: string;
  tone: "positive" | "negative" | "neutral" | "warning";
  icon: ReactNode;
};

export function MetricCard({
  label,
  value,
  detail,
  trend,
  tone,
  icon,
}: MetricCardProps) {
  return (
    <Card className="metric-card">
      <div className="metric-card-topline">
        <span className="metric-icon" aria-hidden="true">
          {icon}
        </span>
        <StatusBadge tone={tone}>{trend}</StatusBadge>
      </div>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-detail">{detail}</p>
    </Card>
  );
}
