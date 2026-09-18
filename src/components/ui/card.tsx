import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return <section className={`surface-card ${className}`}>{children}</section>;
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="card-header">{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="card-title">{children}</h2>;
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="card-description">{children}</p>;
}
