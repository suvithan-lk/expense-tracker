import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="ui-state ui-empty-state"><span className="empty-mark" aria-hidden="true">◎</span><h2>{title}</h2><p>{description}</p>{action}</div>;
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return <div className="ui-state ui-loading-state" aria-busy="true" aria-label={label}><span /><span /><span /></div>;
}

export function ErrorState({ title = "Something went wrong", description, action }: { title?: string; description: string; action?: ReactNode }) {
  return <div className="ui-state ui-error-state" role="alert"><span className="error-mark" aria-hidden="true">!</span><h2>{title}</h2><p>{description}</p>{action}</div>;
}
