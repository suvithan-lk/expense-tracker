import { Card } from "@/components/ui/card";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="placeholder-page">
      <div>
        <p className="section-kicker">Coming next</p>
        <h1 className="page-title">{title}</h1>
        <p className="page-lede">{description}</p>
      </div>
      <Card className="placeholder-card">
        <span className="placeholder-orbit" aria-hidden="true">✦</span>
        <div>
          <h2>We are preparing this view</h2>
          <p>This space is ready for the next phase of your financial workspace.</p>
        </div>
      </Card>
    </div>
  );
}
