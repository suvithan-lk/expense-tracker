"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MetricCard } from "@/components/common/metric-card";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { listCategories } from "@/lib/categories/api";
import { getFinancialReport } from "@/lib/reports/api";
import { formatCurrency } from "@/lib/utils/format-currency";
import type { Category } from "@/types/category";
import type { FinancialReport } from "@/types/report";

const chartColors = ["#173d33", "#e8c775", "#ef876e", "#8db69a", "#aab9a7"];
const monthOptions = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function dateRangeForMonth(month: number, year: number) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  return { from, to: `${year}-${String(month).padStart(2, "0")}-${lastDay}` };
}

function emptyReport(): FinancialReport {
  return { periodLabel: "Selected period", totalIncome: 0, totalExpenses: 0, netBalance: 0, savings: 0, savingsRate: 0, incomeBreakdown: [], expenseBreakdown: [], budgetPerformance: [] };
}

function changeLabel(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function ReportsView() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [isCustom, setIsCustom] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [report, setReport] = useState<FinancialReport>(emptyReport);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    listCategories("expense")
      .then((response) => { if (isCurrent) setCategories(response.data ?? []); })
      .catch(() => undefined)
      .finally(() => { if (isCurrent) setCategoryLoading(false); });
    return () => { isCurrent = false; };
  }, []);

  const query = useMemo(() => isCustom ? { ...customRange, categoryId: categoryId || undefined } : { ...dateRangeForMonth(month, year), categoryId: categoryId || undefined }, [categoryId, customRange, isCustom, month, year]);

  useEffect(() => {
    let isCurrent = true;
    getFinancialReport(query)
      .then((response) => { if (isCurrent) { setReport({ ...emptyReport(), ...response.data }); setError(null); } })
      .catch((requestError: unknown) => { if (isCurrent) setError(requestError instanceof Error ? requestError.message : "Unable to load this report."); })
      .finally(() => { if (isCurrent) setIsLoading(false); });
    return () => { isCurrent = false; };
  }, [query]);

  function updateMonth(nextMonth: number, nextYear: number) {
    setIsCustom(false);
    setIsLoading(true);
    setMonth(nextMonth);
    setYear(nextYear);
  }

  return (
    <div className="reports-page">
      <div className="page-heading-row"><div><p className="section-kicker">Make sense of the story</p><h1 className="page-title">Reports</h1><p className="page-lede">A considered view of the patterns behind your financial activity.</p></div><Link className="text-button report-dashboard-link" href="/dashboard">Back to dashboard <span aria-hidden="true">↗</span></Link></div>
      <Card className="report-controls-card"><div className="report-controls"><div className="report-control-group"><span>Report period</span><div className="report-period-row"><button className="period-arrow" type="button" onClick={() => updateMonth(month === 1 ? 12 : month - 1, month === 1 ? year - 1 : year)} aria-label="Previous month">←</button><select value={isCustom ? "custom" : `${month}-${year}`} onChange={(event) => { if (event.target.value === "custom") { setIsCustom(true); setIsLoading(true); } else { const [nextMonth, nextYear] = event.target.value.split("-").map(Number); updateMonth(nextMonth, nextYear); } }} aria-label="Report period"><option value={`${month}-${year}`}>{monthOptions[month - 1]} {year}</option><option value="custom">Custom range</option></select><button className="period-arrow" type="button" onClick={() => updateMonth(month === 12 ? 1 : month + 1, month === 12 ? year + 1 : year)} aria-label="Next month">→</button></div>{isCustom && <div className="report-custom-range"><input aria-label="Report start date" type="date" value={customRange.from} onChange={(event) => { setIsLoading(true); setCustomRange({ ...customRange, from: event.target.value }); }} /><span>to</span><input aria-label="Report end date" type="date" value={customRange.to} onChange={(event) => { setIsLoading(true); setCustomRange({ ...customRange, to: event.target.value }); }} /></div>}</div><label className="report-control-group"><span>Category filter</span><select value={categoryId} onChange={(event) => { setIsLoading(true); setCategoryId(event.target.value); }} aria-label="Filter report by category"><option value="">All expense categories</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label></div></Card>
      {error && <div className="dashboard-error report-error" role="alert"><strong>Report unavailable.</strong><span>{error}</span></div>}
      <div className="report-period-label"><span>{report.periodLabel}</span><span>Calculated from your recorded activity</span></div>
      <section className="metric-grid" aria-label="Report summary"><MetricCard label="Total income" value={formatCurrency(report.totalIncome)} detail="For this period" trend={report.totalIncome > 0 ? "Tracked" : "No data"} tone={report.totalIncome > 0 ? "positive" : "neutral"} icon="↗" /><MetricCard label="Total expenses" value={formatCurrency(report.totalExpenses)} detail="For this period" trend={report.totalExpenses > 0 ? "Tracked" : "No data"} tone="neutral" icon="↘" /><MetricCard label="Net balance" value={formatCurrency(report.netBalance)} detail="Income minus expenses" trend={report.netBalance >= 0 ? "Positive" : "Review"} tone={report.netBalance >= 0 ? "positive" : "negative"} icon="◌" /><MetricCard label="Savings rate" value={`${report.savingsRate.toFixed(1)}%`} detail="Savings divided by income" trend={report.savingsRate >= 20 ? "Strong" : "Build"} tone={report.savingsRate >= 20 ? "positive" : report.savingsRate >= 10 ? "neutral" : "warning"} icon="✦" /></section>
      <section className="reports-main-grid"><Card className="report-breakdown-card"><CardHeader><div><p className="section-kicker">Breakdown</p><CardTitle>Income and expenses</CardTitle><CardDescription>Compare the shape of your money by category.</CardDescription></div></CardHeader><div className="report-breakdown-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={[...report.incomeBreakdown.map((item) => ({ name: item.categoryName, income: item.amount, expenses: 0 })), ...report.expenseBreakdown.map((item) => ({ name: item.categoryName, income: 0, expenses: item.amount }))].slice(0, 8)} margin={{ top: 12, right: 10, left: -15, bottom: 0 }}><CartesianGrid stroke="#dfe4da" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="name" tick={{ fill: "#89938c", fontSize: 9 }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={55} /><YAxis tick={{ fill: "#89938c", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} /><Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ border: "1px solid #dfe3d9", borderRadius: 8, fontSize: 11 }} /><Bar dataKey="income" name="Income" fill="#173d33" radius={[4, 4, 0, 0]} /><Bar dataKey="expenses" name="Expenses" fill="#ef876e" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="legend-dot legend-income" /> Income</span><span><i className="legend-dot legend-expense" /> Expenses</span></div></Card><Card className="report-highlights-card"><CardHeader><div><p className="section-kicker">Highlights</p><CardTitle>What stands out</CardTitle></div></CardHeader><div className="report-highlight-list"><div><span>Highest expense category</span><strong>{report.highestExpenseCategory?.categoryName ?? "No data yet"}</strong><small>{report.highestExpenseCategory ? formatCurrency(report.highestExpenseCategory.amount) : "Add expenses to compare"}</small></div><div><span>Net savings</span><strong>{formatCurrency(report.savings)}</strong><small>{report.savingsRate.toFixed(1)}% savings rate</small></div></div></Card></section>
      <section className="reports-secondary-grid"><Card className="report-detail-card"><CardHeader><div><p className="section-kicker">Expense detail</p><CardTitle>Category performance</CardTitle></div></CardHeader>{report.expenseBreakdown.length > 0 ? <div className="report-category-list">{report.expenseBreakdown.map((item, index) => <div className="report-category-row" key={item.categoryId}><div className="category-heading"><span><i className="legend-dot" style={{ background: chartColors[index % chartColors.length] }} />{item.categoryName}</span><strong>{formatCurrency(item.amount)}</strong></div><ProgressBar value={item.percentage} tone={index % 3 === 1 ? "amber" : index % 3 === 2 ? "coral" : "green"} /></div>)}</div> : <div className="chart-empty">No expense breakdown for this period.</div>}</Card><Card className="report-detail-card"><CardHeader><div><p className="section-kicker">Budget performance</p><CardTitle>Planned vs actual</CardTitle></div></CardHeader>{report.budgetPerformance.length > 0 ? <div className="report-budget-list">{report.budgetPerformance.map((item) => <div className="report-budget-row" key={item.id}><div><strong>{item.categoryName}</strong><span>{formatCurrency(item.spentAmount)} of {formatCurrency(item.budgetAmount)}</span></div><StatusBadge tone={item.usagePercentage > 100 ? "negative" : item.usagePercentage >= 70 ? "warning" : "positive"}>{item.usagePercentage.toFixed(0)}% used</StatusBadge></div>)}</div> : <div className="chart-empty">No budgets available for this period.</div>}</Card></section>
      <Card className="comparison-card"><CardHeader><div><p className="section-kicker">Month over month</p><CardTitle>Compared with the previous period</CardTitle></div></CardHeader>{report.comparison ? <div className="comparison-grid"><div><span>Income</span><strong className={report.comparison.incomeChangePercentage >= 0 ? "amount-positive" : "amount-negative"}>{changeLabel(report.comparison.incomeChangePercentage)}</strong></div><div><span>Expenses</span><strong className={report.comparison.expenseChangePercentage <= 0 ? "amount-positive" : "amount-negative"}>{changeLabel(report.comparison.expenseChangePercentage)}</strong></div><div><span>Balance</span><strong className={report.comparison.balanceChangePercentage >= 0 ? "amount-positive" : "amount-negative"}>{changeLabel(report.comparison.balanceChangePercentage)}</strong></div><p>{report.comparison.previousPeriodLabel}</p></div> : <div className="chart-empty">A comparison will appear when the API has a previous period to compare.</div>}</Card>
      {categoryLoading && <span className="sr-only">Loading report categories</span>}
      {isLoading && <span className="sr-only">Loading financial report</span>}
    </div>
  );
}
