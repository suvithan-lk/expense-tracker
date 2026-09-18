type ProgressBarProps = {
  value: number;
  tone?: "green" | "amber" | "coral";
};

export function ProgressBar({ value, tone = "green" }: ProgressBarProps) {
  const boundedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="progress-track" aria-label={`${boundedValue}% complete`}>
      <div
        className={`progress-fill progress-fill-${tone}`}
        style={{ width: `${boundedValue}%` }}
      />
    </div>
  );
}
