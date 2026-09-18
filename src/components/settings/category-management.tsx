"use client";

import { useEffect, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createCategory, deleteCategory, listCategories, updateCategory } from "@/lib/categories/api";
import type { Category, CategoryType } from "@/types/category";

const defaultCategoryNames = {
  income: ["Salary", "Freelance", "Business", "Investment", "Other Income"],
  expense: ["Food", "Transport", "Housing", "Utilities", "Internet", "Mobile", "Health", "Education", "Shopping", "Entertainment", "Debt Payment", "Other"],
};

export function CategoryManagement() {
  const [activeType, setActiveType] = useState<CategoryType>("expense");
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTypeChange(type: CategoryType) {
    setActiveType(type);
    setIsLoading(true);
    setError(null);
    setEditingId(null);
    setPendingDelete(null);
  }

  useEffect(() => {
    let isCurrent = true;

    listCategories(activeType)
      .then((response) => {
        if (isCurrent) {
          setCategories(response.data ?? []);
        }
      })
      .catch((requestError: unknown) => {
        if (isCurrent) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load categories.");
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [activeType]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) {
      setError("Category name is required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await createCategory({ name, type: activeType });
      setCategories((current) => [...current, response.data]);
      setNewName("");
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create category.");
    } finally {
      setIsSaving(false);
    }
  }

  function beginEditing(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
    setPendingDelete(null);
    setError(null);
  }

  async function saveEdit(id: string) {
    const name = editingName.trim();
    if (!name) {
      setError("Category name is required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await updateCategory(id, { name });
      setCategories((current) => current.map((category) => category.id === id ? response.data : category));
      setEditingId(null);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Unable to rename category.");
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete(id: string) {
    setIsSaving(true);
    setError(null);
    try {
      await deleteCategory(id);
      setCategories((current) => current.filter((category) => category.id !== id));
      setPendingDelete(null);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete category. Transactions may depend on it.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="category-management-card">
      <CardHeader>
        <div>
          <p className="section-kicker">Your taxonomy</p>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Keep your financial language simple and useful.</CardDescription>
        </div>
        <span className="category-count">{categories.length} {categories.length === 1 ? "category" : "categories"}</span>
      </CardHeader>

      <div className="category-tabs" role="tablist" aria-label="Category type">
        {(["expense", "income"] as CategoryType[]).map((type) => (
          <button className={activeType === type ? "category-tab category-tab-active" : "category-tab"} type="button" role="tab" aria-selected={activeType === type} onClick={() => handleTypeChange(type)} key={type}>
            {type === "expense" ? "Expense categories" : "Income categories"}
          </button>
        ))}
      </div>

      <form className="category-create-form" onSubmit={handleCreate}>
        <label htmlFor="new-category">Add a {activeType} category</label>
        <div className="category-create-row">
          <input id="new-category" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder={activeType === "expense" ? "e.g. Subscriptions" : "e.g. Consulting"} maxLength={60} />
          <button className="forest-button" type="submit" disabled={isSaving}>Add category <span aria-hidden="true">+</span></button>
        </div>
      </form>

      {error && <p className="form-error category-error" role="alert">{error}</p>}

      {isLoading ? (
        <div className="category-loading" aria-busy="true"><span /><span /><span /></div>
      ) : categories.length === 0 ? (
        <div className="category-empty">
          <span className="empty-mark" aria-hidden="true">◎</span>
          <h3>No {activeType} categories yet</h3>
          <p>Start with a category above, or ask the backend to seed the defaults: {defaultCategoryNames[activeType].slice(0, 3).join(", ")}.</p>
        </div>
      ) : (
        <div className="category-list-management" role="list">
          {categories.map((category) => (
            <div className="managed-category-row" role="listitem" key={category.id}>
              {editingId === category.id ? (
                <input className="category-edit-input" value={editingName} onChange={(event) => setEditingName(event.target.value)} aria-label={`Rename ${category.name}`} autoFocus />
              ) : (
                <span className="managed-category-name"><span className="category-bullet" aria-hidden="true" />{category.name}</span>
              )}
              <div className="category-row-actions">
                {pendingDelete === category.id ? (
                  <><span className="delete-prompt">Delete this category?</span><button className="quiet-button quiet-button-danger" type="button" onClick={() => confirmDelete(category.id)} disabled={isSaving}>Yes, delete</button><button className="quiet-button" type="button" onClick={() => setPendingDelete(null)}>Cancel</button></>
                ) : editingId === category.id ? (
                  <><button className="quiet-button quiet-button-primary" type="button" onClick={() => saveEdit(category.id)} disabled={isSaving}>Save</button><button className="quiet-button" type="button" onClick={() => setEditingId(null)}>Cancel</button></>
                ) : (
                  <><button className="quiet-button" type="button" onClick={() => beginEditing(category)}>Rename</button><button className="quiet-button quiet-button-danger" type="button" onClick={() => setPendingDelete(category.id)}>Delete</button></>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
