# API Contracts (v1)

Base URL: `http://localhost:5029` (local) — no `/api/v1` prefix, just `/api/*`.

Every response is wrapped as either `{ "data": ..., "message": "Success" }` or, on failure, `{ "message": "...", "errors": { "field": ["..."] } | null }`. `errors` is only populated for `400 Validation failed` responses.

All endpoints except `/api/health` and `/api/auth/*` require `Authorization: Bearer <accessToken>` and are scoped to the caller.

## Auth — `/api/auth`

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/register` | `{ name, email, password }` | Creates the user, seeds default categories, returns `AuthPayload`. `409` on duplicate email. |
| POST | `/login` | `{ email, password }` | Returns `AuthPayload`. `401` on bad credentials. |
| POST | `/refresh` | `{ refreshToken }` | Rotates the refresh token and returns a new `AuthPayload`. `401` if unknown, expired, or already used. |
| POST | `/logout` | `{ refreshToken }` | Revokes the token server-side. Always `204`. |
| GET | `/me` | — | Requires auth. Returns `UserResponse`. |

```ts
AuthPayload   = { token: string, refreshToken: string, user: UserResponse }
UserResponse  = { id: string, name: string, email: string }
```

## Categories — `/api/categories`

| Method | Path | Query / Body | Notes |
|---|---|---|---|
| GET | `/` | `?type=income\|expense` | |
| POST | `/` | `{ name, type }` | `409` on duplicate name within the same type (case-insensitive) |
| PUT | `/{id}` | `{ name }` | Rename only |
| DELETE | `/{id}` | — | `409` if income/expense transactions or a budget still reference it |

```ts
CategoryResponse = { id, name, type: "income" | "expense", createdAt, updatedAt }
```

## Income — `/api/income` · Expenses — `/api/expenses`

Identical shape; `expenses` uses expense-type categories and `expenseDate` instead of `incomeDate`.

| Method | Path | Query / Body |
|---|---|---|
| GET | `/` | `?page&pageSize&sort=incomeDate\|amount.asc\|desc&search&categoryId&from&to` |
| GET | `/{id}` | — |
| POST | `/` | `{ amount, categoryId, description?, incomeDate }` |
| PUT | `/{id}` | same body as POST |
| DELETE | `/{id}` | — |

```ts
IncomeTransactionResponse = {
  id, userId, categoryId, categoryName, amount, description,
  incomeDate, createdAt, updatedAt
}
PagedResult<T> = { items: T[], totalCount, page, pageSize }
```

`amount` must be `> 0`; `categoryId` must belong to the caller and be an **income**-type category (expense-type for the `expenses` resource).

## Budgets — `/api/budgets`

| Method | Path | Query / Body |
|---|---|---|
| GET | `/` | `?month&year&categoryId?` |
| POST | `/` | `{ amount, categoryId?, month, year }` — omit `categoryId` for a whole-month budget |
| PUT | `/{id}` | same body as POST |
| DELETE | `/{id}` | — |

```ts
BudgetResponse = {
  id, userId, categoryId?, categoryName?, amount,
  spentAmount, remainingAmount, usagePercentage,
  month, year, createdAt, updatedAt
}
BudgetListResponse = { items: BudgetResponse[], totalCount }
```

`409` on a duplicate category+month or a duplicate whole-month budget. `spentAmount`/`remainingAmount`/`usagePercentage` are computed live from that month's expenses — never cached.

## Dashboard — `/api/dashboard`

| Method | Path | Query |
|---|---|---|
| GET | `/summary` | `?period=currentMonth\|previousMonth\|custom&from?&to?` |

```ts
DashboardSummaryResponse = {
  totalIncome, totalExpenses, balance, savings, savingsRate,
  incomeCount, expenseCount,
  previousTotalExpenses, previousExpenseByCategory,
  expenseByCategory: { categoryId, categoryName, amount, percentage }[],
  budgetUsage: null,           // reserved; dashboard doesn't compute this — use /api/reports/summary
  cashFlow: { label, income, expenses }[],       // one point per day in range
  recentActivity: { id, type, label, categoryName, amount, date }[]   // most recent 8, income + expenses merged
}
```

`period=custom` requires `from` and `to`; `from` must be on or before `to`, or the request returns `400`.

## Reports — `/api/reports`

| Method | Path | Query |
|---|---|---|
| GET | `/summary` | `?from&to&categoryId?` |

```ts
FinancialReportResponse = {
  periodLabel,                 // "September 2026" for a full calendar month, otherwise "1 Sep 2026 – 15 Sep 2026"
  totalIncome, totalExpenses, netBalance, savings, savingsRate,
  highestExpenseCategory?: { categoryId, categoryName, amount, percentage },
  incomeBreakdown: Breakdown[],
  expenseBreakdown: Breakdown[],   // narrowed to categoryId if provided; income is never filtered by it
  budgetPerformance: { id, categoryName, budgetAmount, spentAmount, usagePercentage }[],
  comparison?: { previousPeriodLabel, incomeChangePercentage, expenseChangePercentage, balanceChangePercentage }
}
```

`comparison` is against the immediately preceding period — the full previous calendar month when the request is exactly one calendar month, otherwise an equal-length preceding window. `budgetPerformance` includes every budget whose month overlaps `[from, to]`, each recomputed for its own month.
