type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "positive" | "neutral" | "warning" | "negative";
};

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}
