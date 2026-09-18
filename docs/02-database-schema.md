# Database Schema (PostgreSQL)

Generated from EF Core migrations in `Backend/FinancialAdvisor.Api/Data/Migrations`. All primary keys are `uuid DEFAULT gen_random_uuid()`; all timestamps are `timestamptz`.

## `Users`

| Column | Type | Notes |
|---|---|---|
| `Id` | uuid PK | |
| `Name` | varchar(100) | |
| `Email` | varchar(256) | display value, original casing |
| `NormalizedEmail` | varchar(256) | lowercased; **unique index** |
| `PasswordHash` | text | produced by `IPasswordHasherService` — never returned by any endpoint |
| `CreatedAt`, `UpdatedAt` | timestamptz | |

## `RefreshTokens`

| Column | Type | Notes |
|---|---|---|
| `Id` | uuid PK | |
| `UserId` | uuid FK → `Users.Id`, `ON DELETE CASCADE` | |
| `TokenHash` | varchar(128) | SHA-256 of the opaque token the client holds; **unique index**. The raw token is never persisted. |
| `ExpiresAt` | timestamptz | `Jwt:RefreshTokenExpiryDays` from issue time (default 30 days) |
| `CreatedAt` | timestamptz | |
| `RevokedAt` | timestamptz, nullable | set on rotation (refresh) or explicit logout |

Indexes: `UserId`.

## `Categories`

| Column | Type | Notes |
|---|---|---|
| `Id` | uuid PK | |
| `UserId` | uuid FK → `Users.Id`, `ON DELETE CASCADE` | |
| `Name` | varchar(100) | |
| `Type` | int (enum: `Income` = 0, `Expense` = 1) | |
| `CreatedAt`, `UpdatedAt` | timestamptz | |

Indexes: unique per `(UserId, Type, lower(Name))` enforced in application code (`CategoryService.EnsureNameIsUniqueAsync`), not a database constraint. Default categories (5 income, 12 expense — see `Common/DefaultCategories.cs`) are seeded for every new user at registration.

## `IncomeTransactions` / `ExpenseTransactions`

Structurally identical tables (see [`docs/07-development-plan.md`](07-development-plan.md#phase-5-expense-management) for why they aren't merged into one polymorphic table).

| Column | Type | Notes |
|---|---|---|
| `Id` | uuid PK | |
| `UserId` | uuid FK → `Users.Id`, `ON DELETE CASCADE` | |
| `CategoryId` | uuid FK → `Categories.Id`, `ON DELETE RESTRICT` | must belong to the same user and match the transaction's own type (income category for `IncomeTransactions`, expense category for `ExpenseTransactions`) |
| `Amount` | numeric(14,2) | validated `> 0` in the service layer |
| `Description` | varchar(500), nullable | |
| `IncomeDate` / `ExpenseDate` | date | |
| `CreatedAt`, `UpdatedAt` | timestamptz | |

Indexes: `UserId`, `CategoryId`, `(UserId, IncomeDate)` / `(UserId, ExpenseDate)`.

## `Budgets`

| Column | Type | Notes |
|---|---|---|
| `Id` | uuid PK | |
| `UserId` | uuid FK → `Users.Id`, `ON DELETE CASCADE` | |
| `CategoryId` | uuid FK → `Categories.Id`, `ON DELETE RESTRICT`, **nullable** | `NULL` means a whole-month ("all expenses") budget |
| `Amount` | numeric(14,2) | validated `> 0` |
| `Month` | int (1–12) | |
| `Year` | int | |
| `CreatedAt`, `UpdatedAt` | timestamptz | |

Indexes: `UserId`; two **partial unique indexes** enforce "at most one budget per category per month" and "at most one whole-month budget per month" independently:
- `(UserId, CategoryId, Month, Year)` where `CategoryId IS NOT NULL`
- `(UserId, Month, Year)` where `CategoryId IS NULL`

`spentAmount`, `remainingAmount`, and `usagePercentage` are **never stored** — they're computed on every read from `ExpenseTransactions` for the budget's own month/category.

## Entity-relationship summary

```
Users 1──* RefreshTokens
Users 1──* Categories
Users 1──* IncomeTransactions ──* Categories (type = Income)
Users 1──* ExpenseTransactions ──* Categories (type = Expense)
Users 1──* Budgets ──0..1 Categories (type = Expense)
```

Deleting a `Category` is blocked at the service layer (`CategoryService.DeleteAsync`, returning `409`) while any `IncomeTransaction`, `ExpenseTransaction`, or `Budget` still references it — the `ON DELETE RESTRICT` foreign keys are a second line of defense, not the primary UX.
