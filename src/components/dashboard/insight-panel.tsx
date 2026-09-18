import { Card } from "@/components/ui/card";
import type { FinancialInsight } from "@/types/dashboard";

type InsightPanelProps = {
  insights: FinancialInsight[];
  isLoading: boolean;
};

const insightIcons = {
  warning: "!",
  info: "i",
  positive: "✦",
};

export function InsightPanel({ insights, isLoading }: InsightPanelProps) {
  return (
    <Card className={`insight-list-card ${isLoading ? "insight-card-muted" : ""}`}>
      <div className="insight-list-header">
        <div className="insight-spark" aria-hidden="true">✦</div>
        <div>
          <p className="section-kicker">Transparent guidance</p>
          <h2>Useful nudges</h2>
        </div>
      </div>
      {insights.length > 0 ? (
        <div className="insight-list" aria-label="Financial insights">
          {insights.map((insight) => (
            <article className={`insight-item insight-item-${insight.type}`} key={`${insight.type}-${insight.title}-${insight.period}`}>
              <span className="insight-item-icon" aria-hidden="true">{insightIcons[insight.type]}</span>
              <div>
                <h3>{insight.title}</h3>
                <p>{insight.description}</p>
                <span className="insight-period">{insight.categoryName ? `${insight.categoryName} · ` : ""}{insight.period}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="insight-list-empty">
          <h3>Your dashboard is ready.</h3>
          <p>Once your financial activity arrives, Folia will surface transparent observations here.</p>
        </div>
      )}
      <p className="insight-disclaimer">Calculated insights for education, not regulated financial advice.</p>
    </Card>
  );
}
