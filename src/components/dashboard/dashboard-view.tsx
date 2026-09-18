"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MetricCard } from "@/components/common/metric-card";
import { InsightPanel } from "@/components/dashboard/insight-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { getDashboardSummary } from "@/lib/dashboard/api";
import { buildInsights } from "@/lib/dashboard/insights";
import { formatCurrency } from "@/lib/utils/format-currency";
import type { DashboardPeriod, DashboardSummary } from "@/types/dashboard";

const chartColors = ["#173d33", "#e8c775", "#ef876e", "#8db69a", "#aab9a7"];

function periodLabel(period: DashboardPeriod) {
  if (period === "previousMonth") return "Previous month";
  if (period === "custom") return "Custom range";
  return "Current month";
}

function emptySummary(): DashboardSummary {
  return { totalIncome: 0, totalExpenses: 0, balance: 0, savings: 0, savingsRate: 0, incomeCount: 0, expenseCount: 0, expenseByCategory: [], cashFlow: [], recentActivity: [] };
}

export function DashboardView() {
  const [period, setPeriod] = useState<DashboardPeriod>("currentMonth");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const query = period === "custom" ? { period, from: customRange.from || undefined, to: customRange.to || undefined } : { period };

    getDashboardSummary(query)
      .then((response) => {
        if (isCurrent) {
          setSummary({ ...emptySummary(), ...response.data, savingsRate: response.data?.savingsRate ?? 0 });
          setError(null);
        }
      })
      .catch((requestError: unknown) => {
        if (isCurrent) setError(requestError instanceof Error ? requestError.message : "Unable to load your dashboard.");
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => { isCurrent = false; };
  }, [customRange.from, customRange.to, period]);

  const insights = buildInsights(summary, periodLabel(period));
  const balanceTone = summary.balance >= 0 ? "positive" : "negative";
  const savingsTone = summary.savingsRate >= 20 ? "positive" : summary.savingsRate >= 10 ? "neutral" : "warning";

  function handlePeriodChange(nextPeriod: DashboardPeriod) {
    setPeriod(nextPeriod);
    setError(null);
    setIsLoading(true);
  }

  return (
    <div className="dashboard-page">
      <div className="page-heading-row">
        <div><p className="section-kicker">Your overview</p><h1 className="page-title">Good morning, Suvit.</h1><p className="page-lede">A clear view of your money for the {periodLabel(period).toLowerCase()}.</p></div>
        <div className="dashboard-period-controls">
          <select className="period-control" value={period} onChange={(event) => handlePeriodChange(event.target.value as DashboardPeriod)} aria-label="Dashboard period">
            <option value="currentMonth">Current month</option><option value="previousMonth">Previous month</option><option value="custom">Custom range</option>
          </select>
          {period === "custom" && <div className="custom-period-fields"><input aria-label="Start date" type="date" value={customRange.from} onChange={(event) => setCustomRange({ ...customRange, from: event.target.value })} /><span>to</span><input aria-label="End date" type="date" value={customRange.to} onChange={(event) => setCustomRange({ ...customRange, to: event.target.value })} /></div>}
        </div>
      </div>

      {error && <div className="dashboard-error" role="alert"><strong>Dashboard unavailable.</strong><span>{error}</span></div>}
      <section className="metric-grid" aria-label="Financial summary">
        <MetricCard label="Total income" value={formatCurrency(summary.totalIncome)} detail={`${summary.incomeCount} income ${summary.incomeCount === 1 ? "entry" : "entries"}`} trend={summary.totalIncome > 0 ? "Tracked" : "No data"} tone={summary.totalIncome > 0 ? "positive" : "neutral"} icon="↗" />
        <MetricCard label="Total expenses" value={formatCurrency(summary.totalExpenses)} detail={`${summary.expenseCount} expense ${summary.expenseCount === 1 ? "entry" : "entries"}`} trend={summary.totalExpenses > 0 ? "Tracked" : "No data"} tone={summary.totalExpenses > 0 ? "neutral" : "neutral"} icon="↘" />
        <MetricCard label="Available balance" value={formatCurrency(summary.balance)} detail="Income minus expenses" trend={summary.balance >= 0 ? "Positive" : "Review"} tone={balanceTone} icon="◌" />
        <MetricCard label="Savings rate" value={`${summary.savingsRate.toFixed(1)}%`} detail="Savings divided by income" trend={summary.savingsRate >= 20 ? "Strong" : "Build"} tone={savingsTone} icon="✦" />
      </section>

      <section className="dashboard-grid">
        <Card className="cashflow-card chart-card">
          <CardHeader><div><p className="section-kicker">Cash flow</p><CardTitle>Income vs expenses</CardTitle><CardDescription>Movement across the selected period</CardDescription></div><StatusBadge tone={balanceTone}>{summary.balance >= 0 ? "Surplus" : "Deficit"}</StatusBadge></CardHeader>
          <div className="rechart-wrap" aria-label="Income and expense trend chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={summary.cashFlow} margin={{ top: 12, right: 5, left: -18, bottom: 0 }}><CartesianGrid stroke="#dfe4da" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="label" tick={{ fill: "#89938c", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#89938c", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} /><Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ border: "1px solid #dfe3d9", borderRadius: 8, fontSize: 11, color: "#142b26" }} /><Line type="monotone" dataKey="income" name="Income" stroke="#173d33" strokeWidth={3} dot={false} /><Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef876e" strokeWidth={3} strokeDasharray="7 7" dot={false} /></LineChart></ResponsiveContainer></div>
          <div className="chart-legend"><span><i className="legend-dot legend-income" /> Income</span><span><i className="legend-dot legend-expense" /> Expenses</span><span className="chart-note">{formatCurrency(summary.balance)} balance</span></div>
        </Card>

        <Card className="spending-card chart-card">
          <CardHeader><div><p className="section-kicker">Where it goes</p><CardTitle>Spending mix</CardTitle></div><Link className="text-button" href="/reports">View report <span aria-hidden="true">↗</span></Link></CardHeader>
          {summary.expenseByCategory.length > 0 ? <><div className="pie-chart-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={summary.expenseByCategory} dataKey="amount" nameKey="categoryName" cx="50%" cy="50%" innerRadius="55%" outerRadius="78%" paddingAngle={3}>{summary.expenseByCategory.map((category, index) => <Cell fill={chartColors[index % chartColors.length]} key={category.categoryId} />)}</Pie><Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ border: "1px solid #dfe3d9", borderRadius: 8, fontSize: 11 }} /></PieChart></ResponsiveContainer><div className="pie-center"><strong>{formatCurrency(summary.totalExpenses)}</strong><span>total spend</span></div></div><div className="category-list">{summary.expenseByCategory.slice(0, 4).map((category, index) => <div className="category-row" key={category.categoryId}><div className="category-heading"><span><i className="legend-dot" style={{ background: chartColors[index % chartColors.length] }} />{category.categoryName}</span><strong>{formatCurrency(category.amount)}</strong></div><ProgressBar value={category.percentage} tone={index % 3 === 1 ? "amber" : index % 3 === 2 ? "coral" : "green"} /></div>)}</div></> : <div className="chart-empty">No expense categories in this period.</div>}
        </Card>
      </section>

      <section className="bottom-grid">
        <Card className="activity-card"><CardHeader><div><p className="section-kicker">Latest movement</p><CardTitle>Recent activity</CardTitle></div><Link className="text-button" href="/income">See all <span aria-hidden="true">↗</span></Link></CardHeader>{summary.recentActivity.length > 0 ? <div className="activity-list">{summary.recentActivity.map((item) => <div className="activity-row" key={item.id}><span className={`activity-icon ${item.type === "income" ? "activity-income" : "activity-expense"}`} aria-hidden="true">{item.type === "income" ? "↗" : "↘"}</span><div className="activity-copy"><strong>{item.label}</strong><span>{item.categoryName} · {new Intl.DateTimeFormat("en-LK", { day: "2-digit", month: "short" }).format(new Date(item.date))}</span></div><strong className={item.type === "income" ? "amount-positive" : "amount-negative"}>{item.type === "income" ? "+" : "−"}{formatCurrency(item.amount)}</strong></div>)}</div> : <div className="chart-empty">Your latest income and expenses will appear here.</div>}</Card>
        <InsightPanel insights={insights} isLoading={isLoading} />
      </section>
    </div>
  );
}
