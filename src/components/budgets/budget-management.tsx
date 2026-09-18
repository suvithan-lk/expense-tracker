"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { listCategories } from "@/lib/categories/api";
import { createBudget, deleteBudget, listBudgets, updateBudget } from "@/lib/budgets/api";
import { formatCurrency } from "@/lib/utils/format-currency";
import { budgetThresholds, getBudgetStatus } from "@/config/budget";
import type { Category } from "@/types/category";
import type { Budget, BudgetInput } from "@/types/budget";

const budgetSchema = z.object({
  amount: z.string().refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, "Budget amount must be greater than zero."),
  categoryId: z.string().optional(),
  month: z.string().min(1, "Choose a month."),
  year: z.string().refine((value) => Number(value) >= 2000 && Number(value) <= 2100, "Enter a valid year."),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

type BudgetFormProps = {
  categories: Category[];
  budget?: Budget;
  onSaved: (budget: Budget) => void;
  onCancel: () => void;
};

function BudgetForm({ categories, budget, onSaved, onCancel }: BudgetFormProps) {
  const now = new Date();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      amount: budget ? String(budget.amount) : "",
      categoryId: budget?.categoryId ?? "",
      month: String(budget?.month ?? now.getMonth() + 1),
      year: String(budget?.year ?? now.getFullYear()),
    },
  });
  const [serverError, setServerError] = useState<string | null>(null);

  async function submit(values: BudgetFormValues) {
    setServerError(null);
    const input: BudgetInput = { amount: Number(values.amount), categoryId: values.categoryId || undefined, month: Number(values.month), year: Number(values.year) };
    try {
      const response = budget ? await updateBudget(budget.id, input) : await createBudget(input);
      onSaved(response.data);
    } catch (requestError: unknown) {
      setServerError(requestError instanceof Error ? requestError.message : "Unable to save budget.");
    }
  }

  return (
    <div className="budget-form-panel">
      <div className="income-form-heading"><div><p className="section-kicker">{budget ? "Update plan" : "New plan"}</p><h2>{budget ? "Edit budget" : "Create a budget"}</h2></div><button className="close-button" type="button" onClick={onCancel} aria-label="Close budget form">×</button></div>
      <form className="income-form" onSubmit={handleSubmit(submit)} noValidate>
        <div className="income-form-grid">
          <label className="income-field"><span>Budget amount</span><div className="amount-input"><span>LKR</span><input type="number" min="0.01" step="0.01" placeholder="0.00" {...register("amount")} /></div>{errors.amount && <small>{errors.amount.message}</small>}</label>
          <label className="category-select"><span>Category <em>Optional for total budget</em></span><select {...register("categoryId")}><option value="">All expenses</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
          <label className="income-field"><span>Month</span><select {...register("month")}><option value="1">January</option><option value="2">February</option><option value="3">March</option><option value="4">April</option><option value="5">May</option><option value="6">June</option><option value="7">July</option><option value="8">August</option><option value="9">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option></select>{errors.month && <small>{errors.month.message}</small>}</label>
          <label className="income-field"><span>Year</span><input type="number" min="2000" max="2100" {...register("year")} />{errors.year && <small>{errors.year.message}</small>}</label>
        </div>
        {serverError && <p className="form-error" role="alert">{serverError}</p>}
        <div className="income-form-actions"><button className="quiet-button" type="button" onClick={onCancel}>Cancel</button><button className="forest-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : budget ? "Save changes" : "Create budget"}</button></div>
      </form>
    </div>
  );
}

export function BudgetManagement() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    listCategories("expense")
      .then((response) => { if (isCurrent) setCategories(response.data ?? []); })
      .catch(() => { if (isCurrent) setError("Unable to load expense categories."); })
      .finally(() => { if (isCurrent) setIsCategoryLoading(false); });
    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    let isCurrent = true;
    listBudgets(month, year, filterCategory || undefined)
      .then((response) => { if (isCurrent) { setBudgets(response.data?.items ?? []); setError(null); } })
      .catch((requestError: unknown) => { if (isCurrent) setError(requestError instanceof Error ? requestError.message : "Unable to load budgets."); })
      .finally(() => { if (isCurrent) setIsLoading(false); });
    return () => { isCurrent = false; };
  }, [filterCategory, month, year]);

  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);

  function changePeriod(nextMonth: number, nextYear: number) {
    setIsLoading(true);
    setMonth(nextMonth);
    setYear(nextYear);
  }

  function handleSaved(budget: Budget) {
    setBudgets((current) => editingBudget ? current.map((item) => item.id === budget.id ? budget : item) : [budget, ...current]);
    setIsFormOpen(false);
    setEditingBudget(undefined);
  }

  async function confirmDelete(id: string) {
    setIsDeleting(true);
    try {
      await deleteBudget(id);
      setBudgets((current) => current.filter((budget) => budget.id !== id));
      setPendingDelete(null);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete budget.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="budget-page">
      <div className="page-heading-row"><div><p className="section-kicker">Plan with intention</p><h1 className="page-title">Budgets</h1><p className="page-lede">Give every rupee a role with calm, practical monthly planning.</p></div><button className="forest-button add-income-button" type="button" onClick={() => { setEditingBudget(undefined); setIsFormOpen(true); }}>Create budget <span aria-hidden="true">+</span></button></div>
      {isFormOpen && <BudgetForm key={editingBudget?.id ?? "new"} categories={categories} budget={editingBudget} onSaved={handleSaved} onCancel={() => { setIsFormOpen(false); setEditingBudget(undefined); }} />}
      <Card className="budget-list-card">
        <CardHeader><div><p className="section-kicker">Monthly plan</p><CardTitle>{new Intl.DateTimeFormat("en-LK", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1))}</CardTitle><CardDescription>Track planned spending against what has been used.</CardDescription></div><span className="budget-count">{budgets.length} {budgets.length === 1 ? "budget" : "budgets"}</span></CardHeader>
        <div className="budget-filters"><button className="period-arrow" type="button" onClick={() => changePeriod(month === 1 ? 12 : month - 1, month === 1 ? year - 1 : year)} aria-label="Previous month">←</button><select value={month} onChange={(event) => changePeriod(Number(event.target.value), year)} aria-label="Budget month"><option value="1">January</option><option value="2">February</option><option value="3">March</option><option value="4">April</option><option value="5">May</option><option value="6">June</option><option value="7">July</option><option value="8">August</option><option value="9">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option></select><input aria-label="Budget year" type="number" min="2000" max="2100" value={year} onChange={(event) => changePeriod(month, Number(event.target.value))} /><button className="period-arrow" type="button" onClick={() => changePeriod(month === 12 ? 1 : month + 1, month === 12 ? year + 1 : year)} aria-label="Next month">→</button><select value={filterCategory} onChange={(event) => { setIsLoading(true); setFilterCategory(event.target.value); }} aria-label="Filter by category"><option value="">All categories</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></div>
        {error && <p className="form-error budget-inline-error" role="alert">{error}</p>}
        {isLoading ? <div className="budget-loading" aria-busy="true"><span /><span /><span /></div> : budgets.length === 0 ? <div className="budget-empty"><span className="empty-mark" aria-hidden="true">◎</span><h3>No budgets for this month</h3><p>Start with a category budget or create one for all expenses.</p><button className="forest-button" type="button" onClick={() => setIsFormOpen(true)}>Create your first budget <span aria-hidden="true">+</span></button></div> : <div className="budget-grid">{budgets.map((budget) => { const status = getBudgetStatus(budget.usagePercentage); const tone = status === "normal" ? "positive" : status === "warning" ? "warning" : "negative"; return <article className="budget-card" key={budget.id}><div className="budget-card-header"><div><p className="budget-category">{budget.categoryName ?? (budget.categoryId ? categoryNames.get(budget.categoryId) : undefined) ?? "All expenses"}</p><h3>{formatCurrency(budget.amount)}</h3></div><StatusBadge tone={tone}>{status === "normal" ? "On track" : status === "warning" ? "Watch" : status === "high" ? "High usage" : "Exceeded"}</StatusBadge></div><div className="budget-progress-meta"><span>{formatCurrency(budget.spentAmount)} spent</span><strong>{budget.usagePercentage.toFixed(0)}%</strong></div><ProgressBar value={budget.usagePercentage} tone={status === "normal" ? "green" : status === "warning" ? "amber" : "coral"} /><div className="budget-card-footer"><span>{formatCurrency(Math.max(budget.remainingAmount, 0))} remaining</span><div>{pendingDelete === budget.id ? <><button className="quiet-button quiet-button-danger" type="button" onClick={() => confirmDelete(budget.id)} disabled={isDeleting}>Confirm</button><button className="quiet-button" type="button" onClick={() => setPendingDelete(null)}>Cancel</button></> : <><button className="quiet-button" type="button" onClick={() => { setEditingBudget(budget); setIsFormOpen(true); }}>Edit</button><button className="quiet-button quiet-button-danger" type="button" onClick={() => setPendingDelete(budget.id)}>Delete</button></>}</div></div></article>; })}</div>}
        <p className="budget-threshold-note">Normal &lt; {budgetThresholds.normal}% · Warning {budgetThresholds.normal}-{budgetThresholds.warning}% · High usage &gt; {budgetThresholds.warning}% · Exceeded &gt; {budgetThresholds.exceeded}%</p>
        {isCategoryLoading && <span className="sr-only">Loading expense categories</span>}
      </Card>
    </div>
  );
}
