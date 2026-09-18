import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Folia | Personal finance, made clear",
  description: "A calmer, clearer way to track your money, build better habits, and make room for what matters.",
  keywords: ["personal finance app", "budget planner", "expense tracker", "savings tracker", "financial wellness", "Sri Lanka finance"],
  openGraph: {
    title: "Folia | Personal finance, made clear",
    description: "Track the everyday, understand the patterns, and make your next financial decision with more calm.",
    type: "website",
  },
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Folia",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description: "A personal finance workspace for tracking income, expenses, budgets, savings, and financial patterns.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "LKR" },
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><LandingPage /></>;
}
