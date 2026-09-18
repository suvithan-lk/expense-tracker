"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listCategories } from "@/lib/categories/api";
import { createExpense, deleteExpense, listExpenses, updateExpense } from "@/lib/expenses/api";
import { formatCurrency } from "@/lib/utils/format-currency";
import type { Category } from "@/types/category";
import type { ExpenseInput, ExpenseTransaction } from "@/types/expense";

const expenseSchema = z.object({
  amount: z.string().refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, "Amount must be greater than zero."),
  categoryId: z.string().min(1, "Choose an expense category."),
  expenseDate: z.string().min(1, "Choose an expense date."),
  description: z.string().max(240, "Description must be 240 characters or less.").optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

type ExpenseFormProps = {
  categories: Category[];
  expense?: ExpenseTransaction;
  onSaved: (expense: ExpenseTransaction) => void;
  onCancel: () => void;
};

function ExpenseForm({ categories, expense, onSaved, onCancel }: ExpenseFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: expense ? String(expense.amount) : "",
      categoryId: expense?.categoryId ?? "",
      expenseDate: expense?.expenseDate.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      description: expense?.description ?? "",
    },
  });
  const [serverError, setServerError] = useState<string | null>(null);

  async function submit(values: ExpenseFormValues) {
    setServerError(null);
    const input: ExpenseInput = {
      amount: Number(values.amount),
      categoryId: values.categoryId,
      expenseDate: values.expenseDate,
      description: values.description?.trim() || undefined,
    };

    try {
      const response = expense ? await updateExpense(expense.id, input) : await createExpense(input);
      onSaved(response.data);
    } catch (requestError: unknown) {
      setServerError(requestError instanceof Error ? requestError.message : "Unable to save expense.");
    }
  }

  return (
    <div className="expense-form-panel">
      <div className="income-form-heading"><div><p className="section-kicker">{expense ? "Update entry" : "New entry"}</p><h2>{expense ? "Edit expense" : "Add expense"}</h2></div><button className="close-button" type="button" onClick={onCancel} aria-label="Close expense form">×</button></div>
      <form className="income-form" onSubmit={handleSubmit(submit)} noValidate>
        <div className="income-form-grid">
          <label className="income-field"><span>Amount</span><div className="amount-input"><span>LKR</span><input type="number" min="0.01" step="0.01" placeholder="0.00" {...register("amount")} /></div>{errors.amount && <small>{errors.amount.message}</small>}</label>
          <label className="category-select"><span>expense category</span><select {...register("categoryId")} required><option value="">Choose a category</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
          {errors.categoryId && <small className="form-grid-error">{errors.categoryId.message}</small>}
          <label className="income-field"><span>Date</span><input type="date" {...register("expenseDate")} />{errors.expenseDate && <small>{errors.expenseDate.message}</small>}</label>
          <label className="income-field income-description-field"><span>Description <em>Optional</em></span><input type="text" placeholder="e.g. Weekly groceries" {...register("description")} />{errors.description && <small>{errors.description.message}</small>}</label>
        </div>
        {serverError && <p className="form-error" role="alert">{serverError}</p>}
        <div className="income-form-actions"><button className="quiet-button" type="button" onClick={onCancel}>Cancel</button><button className="forest-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : expense ? "Save changes" : "Add expense"}</button></div>
      </form>
    </div>
  );
}

export function ExpenseManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ExpenseTransaction[]>([]);
  const [query, setQuery] = useState("page=1&pageSize=8&sort=expenseDate.desc");
  const [draftFilters, setDraftFilters] = useState({ search: "", categoryId: "", from: "", to: "", sort: "expenseDate.desc" });
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseTransaction | undefined>();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    listCategories("expense")
      .then((response) => { if (isCurrent) setCategories(response.data ?? []); })
      .catch((requestError: unknown) => { if (isCurrent) setCategoryError(requestError instanceof Error ? requestError.message : "Unable to load expense categories."); })
      .finally(() => { if (isCurrent) setIsCategoryLoading(false); });
    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    let isCurrent = true;
    listExpenses(query)
      .then((response) => {
        if (isCurrent) {
          setItems(response.data?.items ?? []);
          setTotalCount(response.data?.totalCount ?? 0);
          setCurrentPage(response.data?.page ?? 1);
        }
      })
      .catch((requestError: unknown) => { if (isCurrent) setError(requestError instanceof Error ? requestError.message : "Unable to load expenses."); })
      .finally(() => { if (isCurrent) setIsLoading(false); });
    return () => { isCurrent = false; };
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(totalCount / 8));
  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ page: "1", pageSize: "8", sort: draftFilters.sort });
    if (draftFilters.search.trim()) params.set("search", draftFilters.search.trim());
    if (draftFilters.categoryId) params.set("categoryId", draftFilters.categoryId);
    if (draftFilters.from) params.set("from", draftFilters.from);
    if (draftFilters.to) params.set("to", draftFilters.to);
    setError(null);
    setIsLoading(true);
    setQuery(params.toString());
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(query);
    params.set("page", String(page));
    setIsLoading(true);
    setQuery(params.toString());
  }

  function handleSaved(expense: ExpenseTransaction) {
    setItems((current) => editingExpense ? current.map((item) => item.id === expense.id ? expense : item) : [expense, ...current]);
    if (!editingExpense) setTotalCount((count) => count + 1);
    setIsFormOpen(false);
    setEditingExpense(undefined);
  }

  async function confirmDelete(id: string) {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteExpense(id);
      setItems((current) => current.filter((item) => item.id !== id));
      setTotalCount((count) => Math.max(0, count - 1));
      setPendingDelete(null);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete expense.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="expense-page">
      <div className="page-heading-row">
        <div><p className="section-kicker">Money out</p><h1 className="page-title">Expenses</h1><p className="page-lede">See where your money goes and build a clearer picture of your habits.</p></div>
        <button className="forest-button add-income-button" type="button" onClick={() => { setEditingExpense(undefined); setIsFormOpen(true); }}>Add expense <span aria-hidden="true">+</span></button>
      </div>

      {isFormOpen && <ExpenseForm key={editingExpense?.id ?? "new"} categories={categories} expense={editingExpense} onSaved={handleSaved} onCancel={() => { setIsFormOpen(false); setEditingExpense(undefined); }} />}

      <Card className="income-list-card">
        <CardHeader><div><p className="section-kicker">Expense ledger</p><CardTitle>All expenses</CardTitle><CardDescription>Search, filter, and keep your spending records tidy.</CardDescription></div><span className="income-count">{totalCount} {totalCount === 1 ? "entry" : "entries"}</span></CardHeader>
        <form className="income-filters" onSubmit={applyFilters}>
          <label className="search-field"><span aria-hidden="true">⌕</span><input type="search" value={draftFilters.search} onChange={(event) => setDraftFilters({ ...draftFilters, search: event.target.value })} placeholder="Search descriptions..." /></label>
          <select value={draftFilters.categoryId} onChange={(event) => setDraftFilters({ ...draftFilters, categoryId: event.target.value })}><option value="">All categories</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select>
          <input aria-label="From date" type="date" value={draftFilters.from} onChange={(event) => setDraftFilters({ ...draftFilters, from: event.target.value })} />
          <input aria-label="To date" type="date" value={draftFilters.to} onChange={(event) => setDraftFilters({ ...draftFilters, to: event.target.value })} />
          <select value={draftFilters.sort} onChange={(event) => setDraftFilters({ ...draftFilters, sort: event.target.value })}><option value="expenseDate.desc">Newest first</option><option value="expenseDate.asc">Oldest first</option><option value="amount.desc">Highest amount</option><option value="amount.asc">Lowest amount</option></select>
          <button className="filter-button" type="submit">Apply</button>
        </form>

        {categoryError && <p className="form-error income-inline-error" role="alert">{categoryError}</p>}
        {error && <p className="form-error income-inline-error" role="alert">{error}</p>}
        {isLoading ? <div className="income-loading" aria-busy="true"><span /><span /><span /><span /></div> : items.length === 0 ? (
          <div className="income-empty"><span className="empty-mark" aria-hidden="true">↘</span><h3>No expense entries yet</h3><p>Add your first expense entry to start seeing where your money is going.</p><button className="forest-button" type="button" onClick={() => setIsFormOpen(true)}>Add your first expense <span aria-hidden="true">+</span></button></div>
        ) : (
          <>
            <div className="income-table-wrap"><table className="income-table"><thead><tr><th>Description</th><th>Category</th><th>Date</th><th className="amount-column">Amount</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><strong>{item.description || "Untitled expense"}</strong></td><td><span className="category-table-label category-expense-label">{item.categoryName ?? categoryNames.get(item.categoryId) ?? "Uncategorized"}</span></td><td>{new Intl.DateTimeFormat("en-LK", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(item.expenseDate))}</td><td className="amount-column amount-negative">−{formatCurrency(item.amount)}</td><td className="income-actions">{pendingDelete === item.id ? <><button className="quiet-button quiet-button-danger" type="button" onClick={() => confirmDelete(item.id)} disabled={isDeleting}>Confirm</button><button className="quiet-button" type="button" onClick={() => setPendingDelete(null)}>Cancel</button></> : <><button className="quiet-button" type="button" onClick={() => { setEditingExpense(item); setIsFormOpen(true); }}>Edit</button><button className="quiet-button quiet-button-danger" type="button" onClick={() => setPendingDelete(item.id)}>Delete</button></>}</td></tr>)}</tbody></table></div>
            <div className="income-pagination"><span>Showing {items.length} of {totalCount} entries</span><div><button className="pagination-button" type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>←</button><span>Page {currentPage} of {totalPages}</span><button className="pagination-button" type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>→</button></div></div>
          </>
        )}
        {isCategoryLoading && <span className="sr-only">Loading expense categories</span>}
      </Card>
    </div>
  );
}
