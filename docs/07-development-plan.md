# Development Plan

This plan breaks the project specification into small, verifiable tasks. Work on one phase at a time. Do not start a later phase until the previous phase's exit criteria are met.

## Working Rules

- Inspect the current implementation before changing it.
- Keep each task small enough to review and test independently.
- Keep frontend and backend API contracts documented as they are introduced.
- Run the relevant checks after each task group.
- Do not add future features to the MVP phase by accident.
- Never commit secrets, local environment files, database credentials, or JWT keys.

## Phase 1: Project Foundation

### 1.1 Repository and documentation

- [x] Confirm the repository layout for `backend`, `frontend`, and `docs`.
- [ ] Add the required project documentation files.
- [x] Review `.gitignore` for Node.js, .NET, IDE, build, and environment files.
- [x] Add `.env.example` files without real secrets.
- [x] Record the supported Node.js, .NET SDK, and PostgreSQL versions.

### 1.2 Frontend baseline

- [x] Inspect the existing Next.js application before editing it.
- [x] Remove the default starter content from the root page.
- [x] Configure global typography, colors, spacing, and responsive defaults.
- [x] Create the application shell with sidebar, header, and main content area.
- [ ] Create reusable UI primitives: button, card, input, select, table, badge, modal, empty state, loading state, and error state.
- [x] Create the dashboard route and its initial empty/loading/error states.
- [x] Add navigation links for dashboard, income, expenses, budgets, reports, and settings.
- [x] Add a reusable currency formatting utility with LKR as the default.
- [x] Define initial frontend domain types and configuration constants.
- [x] Create the centralized API client with GET, POST, PUT, and DELETE methods.
- [x] Read the backend URL from `NEXT_PUBLIC_API_URL`.

### 1.3 Backend baseline

- [x] Create the ASP.NET Core 10 Minimal API project.
- [x] Enable nullable reference types and strict compiler settings.
- [x] Add EF Core 10 and Npgsql packages.
- [x] Add configuration loading for the database and JWT settings.
- [x] Add a health endpoint.
- [x] Add a consistent error response shape and centralized exception handling.
- [x] Configure development CORS for the frontend origin.
- [x] Add the initial database context registration.
- [x] Add a local PostgreSQL and Neon configuration path without hardcoded credentials.

### 1.4 Phase 1 verification

- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Run backend compilation.
- [x] Verify the frontend can start with the API URL from environment configuration.
- [x] Verify the health endpoint returns a successful response.

**Current status:** Phase 1 is complete. The ASP.NET Core 10 Minimal API (`Backend/FinancialAdvisor.Api`) builds cleanly, exposes `GET /api/health`, registers `AppDbContext` with Npgsql (no hardcoded connection string — set via `ConnectionStrings__DefaultConnection`, works with local PostgreSQL or Neon), binds `Jwt` and `Cors` options from configuration, applies a development CORS policy for the frontend origin, and wraps requests in centralized exception-handling middleware returning a consistent `{ data, message }` / `{ message, errors }` response shape. The remaining open item is authoring the `01`–`06` documentation files.

**Exit criteria:** The frontend foundation renders without starter content, the backend starts, the health endpoint works, configuration is environment-based, and all baseline checks pass.

## Phase 2: Authentication

### 2.1 Backend identity model

- [x] Create the `User` entity with UUID ID and UTC timestamps.
- [x] Add a unique normalized email constraint and index.
- [x] Create registration and login request/response DTOs.
- [x] Add request validation for name, email, and password.
- [x] Implement secure password hashing and verification.
- [x] Implement JWT generation from configured key, issuer, audience, and expiry settings.
- [x] Add authentication and authorization middleware.
- [x] Return consistent responses for validation, duplicate email, invalid credentials, and unauthorized requests.

### 2.2 Authentication endpoints

- [x] Implement `POST /api/auth/register`.
- [x] Implement `POST /api/auth/login`.
- [x] Implement `POST /api/auth/refresh` and `POST /api/auth/logout`.
- [x] Implement a protected current-user endpoint.
- [x] Decide whether logout is client-side token removal or server-side token revocation, and document the choice.
- [x] Ensure no password hash or secret is returned in API responses.

### 2.3 Frontend authentication

- [x] Build the login page with React Hook Form and Zod.
- [x] Build the registration page with React Hook Form and Zod.
- [x] Add an authentication state store or provider.
- [x] Attach the JWT to centralized API requests.
- [x] Implement logout and token cleanup.
- [x] Protect authenticated routes and redirect unauthenticated users to `/login`.
- [x] Redirect authenticated users from auth pages to `/dashboard`.
- [x] Add user-facing loading and error states.

### 2.4 Phase 2 verification

- [x] Test successful registration.
- [x] Test duplicate email rejection.
- [x] Test successful login and invalid credentials.
- [x] Test protected endpoint access with and without a token.
- [x] Test logout and route redirection.
- [x] Test that sensitive fields are never exposed.

**Current status:** Phase 2 backend is complete and verified end-to-end against a local PostgreSQL 18 database: `POST /api/auth/register`, `POST /api/auth/login`, and the protected `GET /api/auth/me` all return the `{ data, message }` / `{ message, errors }` envelope the frontend expects. Verified with live requests: successful registration issues a JWT; a repeat registration with the same email returns `409` with a conflict message; registering with a blank name, invalid email, and short password returns `400` with per-field validation errors; logging in with the wrong password returns `401`; calling `/api/auth/me` without a token returns `401` with a JSON body (via a custom `JwtBearerEvents.OnChallenge` handler), and with a valid token returns the current user; no response anywhere includes `passwordHash` or any secret.

Login/register/refresh now all issue an access token (`Jwt:ExpiryMinutes`, default 60) plus an opaque, server-persisted `RefreshToken` (`Jwt:RefreshTokenExpiryDays`, default 30) — the raw value is only ever returned to the client; the database stores a SHA-256 hash. `POST /api/auth/refresh` looks up the hash, rejects an unknown/expired/already-used token with `401`, and rotates it (the old row is marked `RevokedAt` and a new token pair is issued) so a stolen refresh token can only be replayed once before both ends notice. `POST /api/auth/logout` revokes the given refresh token server-side. The frontend (`src/lib/api/client.ts`) transparently retries any request that gets a `401` by calling `/api/auth/refresh` once (de-duplicated across concurrent callers) and replaying the original request with the new access token; if the refresh token itself is invalid, the session is cleared and the user is redirected to `/login`. Verified live: refresh rotation, a rotated (reused) token is rejected with `401`, logout revokes the token so a subsequent refresh also gets `401`, a browser session with a deliberately invalid access token but a valid refresh token transparently recovers with exactly one `/api/auth/refresh` call even when two requests 401 concurrently, and a session with a bogus refresh token is cleared and redirected to `/login`.

**Exit criteria:** A user can register, log in, access protected routes, log out, and receive safe, consistent errors.

## Phase 3: Categories

### 3.1 Category model and seed data

- [x] Create income and expense category entities with UUID IDs.
- [x] Add user ownership, timestamps, indexes, and uniqueness rules.
- [x] Seed default income categories during registration.
- [x] Seed default expense categories during registration.
- [x] Define deletion behavior when transactions depend on a category.

### 3.2 Category API

- [x] Implement list categories by type.
- [x] Implement create category.
- [x] Implement rename/update category.
- [x] Implement safe delete category.
- [x] Enforce authenticated user ownership on every query and mutation.
- [x] Add DTOs and validation; do not expose EF entities.

### 3.3 Category frontend

- [x] Add category management to settings.
- [x] Add category selectors for future income and expense forms.
- [x] Add empty, loading, validation, and delete-confirmation states.

### 3.4 Phase 3 verification

- [x] Verify default categories are created once per new user.
- [x] Verify users cannot view or modify another user's categories.
- [x] Verify categories with dependent transactions cannot be deleted unsafely.

### 3.5 Frontend verification

- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Verify `/settings` serves successfully in the local Next.js app.
- [x] Verify TypeScript diagnostics are clean.
- [x] Verify patch formatting with `git diff --check`.

**Current status:** Phase 3 backend is complete and verified end-to-end against a local PostgreSQL database. A single `Categories` table (with a `Type` discriminator: `Income`/`Expense`) backs `GET /api/categories?type=`, `POST /api/categories`, `PUT /api/categories/{id}`, and `DELETE /api/categories/{id}`, all under `RequireAuthorization()` and scoped to the caller's `UserId` from the JWT — never a client-supplied ID. Verified with live requests: registering a new user auto-seeds the 5 default income and 12 default expense categories from the spec; creating a duplicate name (case-insensitive) for the same user/type returns `409`; an invalid `type` returns `400` with a field error; a second user attempting to rename or delete the first user's category gets `404` (existence is not leaked); the owner can rename and delete their own category (`200` / `204`). Now that Phase 4/5 added `IncomeTransactions`/`ExpenseTransactions` with a `Restrict`-behavior FK to `Categories`, `CategoryService.DeleteAsync` pre-checks for dependent transactions and returns a clean `409` (rather than surfacing the database FK violation as a `500`) — verified live: deleting a category with existing income was rejected with a clear message, while an unused category still deletes normally (`204`).

**Exit criteria:** Each user has isolated default categories and can safely manage them.

## Phase 4: Income Management

### 4.1 Income backend

- [x] Create the income transaction entity with decimal amount and UTC timestamps.
- [x] Add foreign keys to user and income category.
- [x] Add indexes for user, category, and income date.
- [x] Create request and response DTOs.
- [x] Implement amount, category, date, and description validation.
- [x] Implement list, detail, create, update, and delete endpoints.
- [x] Add date, category, search, sort, and pagination query parameters.
- [x] Verify ownership for every detail, update, and delete operation.

### 4.2 Income frontend

- [x] Build the income list page.
- [x] Build the add and edit income form.
- [x] Add category, date, search, sort, and filter controls.
- [x] Add delete confirmation.
- [x] Add table, pagination, loading, empty, and error states.
- [x] Reuse the centralized API client and shared UI components.

### 4.3 Phase 4 verification

- [x] Test valid and invalid amounts.
- [x] Test required category and date validation.
- [x] Test filtering, searching, sorting, and pagination.
- [x] Test user isolation for read, update, and delete operations.
- [x] Confirm money calculations use decimal/numeric values.

### 4.4 Frontend verification

- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Verify the `/income` route compiles and serves through Next.js.
- [x] Verify TypeScript diagnostics are clean.

**Current status:** Phase 4 backend is complete and verified end-to-end against a local PostgreSQL database. `IncomeTransactions` (decimal(14,2) amount, `date`-typed `IncomeDate`, UTC `CreatedAt`/`UpdatedAt`) has FKs to `Users` (cascade) and `Categories` (restrict — blocks deleting a category with dependent income), plus indexes on `UserId`, `CategoryId`, and `(UserId, IncomeDate)`. `GET/POST/PUT/DELETE /api/income` and `GET /api/income/{id}` all enforce ownership via the JWT-derived `UserId`, validate amount > 0 / required category+date / description length, reject a `categoryId` that isn't the caller's own **income**-type category, and support `page`, `pageSize`, `sort` (`incomeDate`/`amount`, asc/desc), `search` (description, case-insensitive), `categoryId`, and `from`/`to` date-range filters. Verified live: create/update/get/delete, invalid amount → 400, wrong-type category → 400, sort/search/date-range filters, cross-user 404s on both read and delete, and a second user's list stays empty.

**Exit criteria:** Users can reliably manage their own income records with validation and filtering.

## Phase 5: Expense Management

### 5.1 Expense backend

- [x] Create the expense transaction entity with decimal amount and UTC timestamps.
- [x] Add foreign keys to user and expense category.
- [x] Add indexes for user, category, and expense date.
- [x] Create request and response DTOs.
- [x] Implement list, detail, create, update, and delete endpoints.
- [x] Add date, category, search, sort, and pagination query parameters.
- [x] Verify ownership for every detail, update, and delete operation.

### 5.2 Expense frontend

- [x] Build the expenses list page.
- [x] Build the add and edit expense form.
- [x] Add category, date, search, sort, and filter controls.
- [x] Add delete confirmation and useful API error messages.
- [x] Reuse shared table, form, state, and feedback components.

### 5.3 Phase 5 verification

- [x] Test valid and invalid expense amounts.
- [x] Test required category and date validation.
- [x] Test filtering, searching, sorting, and pagination.
- [x] Test user isolation for every endpoint.
- [x] Confirm expense totals use decimal/numeric values.

### 5.4 Frontend verification

- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Verify the `/expenses` route compiles and serves through Next.js.
- [x] Verify TypeScript diagnostics are clean.

**Current status:** Phase 5 backend is complete, built as the structural mirror of Phase 4 (`ExpenseTransactions` with the same decimal/date/index/FK design, an `ExpenseService`/`ExpenseEndpoints` pair matching `IncomeService`/`IncomeEndpoints` field-for-field except `ExpenseDate` and the expense-type category check). Verified live with the same test matrix as income: CRUD, invalid amount, wrong-type category rejection, sort/search/date filters, and cross-user 404 isolation.

**Comparing the shared pattern (Phases 4 & 5):** both features turned out identical in shape — entity (amount/description/date/timestamps + user & category FKs), a validate-then-own-then-mutate service, and a thin endpoint file extracting the user id from the JWT. The genuinely shared, non-entity-specific logic (pagination normalization, sort-field parsing, the `PagedResult<T>` envelope) was factored once into `Common/Paging.cs`/`SortSpec.cs` and reused by both services. The entity-specific query/validation logic (60-ish lines each) was kept duplicated rather than merged behind a generic/interface-based transaction engine — EF Core can't cleanly translate LINQ over a shared interface when the two entities name their date column differently (`IncomeDate` vs `ExpenseDate`), and forcing one would add an abstraction with no other consumer, which the coding rules explicitly warn against. If Phase 7+ introduces a third transaction-shaped feature, that would be the point to revisit a shared base.

**Exit criteria:** Users can reliably manage their own expense records with the same quality guarantees as income.

## Phase 6: Dashboard

### 6.1 Dashboard calculations

- [x] Define a date-period request contract for current month, previous month, and custom range.
- [x] Implement total income calculation.
- [x] Implement total expense calculation.
- [x] Implement balance as income minus expenses.
- [x] Implement savings as balance.
- [x] Implement savings rate with a zero-income guard.
- [x] Implement monthly income and expense summaries.
- [x] Implement budget usage placeholder contract for the budgets phase.

### 6.2 Dashboard API and frontend

- [x] Implement a protected dashboard summary endpoint.
- [x] Add income, expense, balance, and savings-rate cards.
- [x] Add period selection controls.
- [x] Add responsive Recharts visualizations for income vs expense, expense by category, monthly trend, and savings trend.
- [x] Add accessible labels, legends, tooltips, and empty states.
- [x] Keep chart data contracts typed and separate from database entities.

### 6.3 Rule-based insights foundation

- [x] Define insight type, severity, period, title, and description types.
- [x] Add transparent calculation rules for negative balance and low savings rate.
- [x] Keep insight generation independent from UI and future AI functionality.
- [x] Clearly label insights as calculations, not regulated financial advice.

### 6.4 Phase 6 verification

- [x] Test all calculations with positive, zero, and negative values.
- [x] Confirm savings rate never returns `NaN` or `Infinity`.
- [x] Compare dashboard totals with transaction fixtures.
- [x] Verify all dashboard data is user-scoped.
- [ ] Check charts at desktop and mobile widths.

### 6.5 Frontend verification

- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Verify the `/dashboard` route compiles and serves through Next.js.
- [x] Verify TypeScript diagnostics are clean.

**Current status:** Phase 6 backend is complete and verified end-to-end against a local PostgreSQL database. `GET /api/dashboard/summary?period=currentMonth|previousMonth|custom&from=&to=` resolves the requested date range (and, for month-over-month comparisons, a same-length previous range — the prior calendar month for `currentMonth`/`previousMonth`, or an equal-length preceding window for `custom`) and computes, purely from `IncomeTransactions`/`ExpenseTransactions` scoped to the caller's `UserId`: total income/expenses, balance, savings, a zero-income-guarded savings rate, income/expense counts, expense-by-category with percentages, the previous period's total/by-category expenses, a per-day cash-flow series across the range, and the 8 most recent income/expense entries merged and sorted by date. `budgetUsage` is returned as `null` (Phase 7 doesn't exist yet) — the frontend's `?:`/`??` handling already treats that as "no data". Verified live: totals match the transaction fixtures created directly against the API; a user with only expenses gets a correctly negative balance and `savingsRate: 0` (not `NaN`/`-Infinity`); a brand-new user gets all zeros and empty arrays without error; an invalid `period` or a `custom` period missing `from`/`to` returns `400`; a second user's dashboard reflects only their own data; unauthenticated requests get `401`.

**Exit criteria:** The dashboard accurately summarizes a user's data for supported periods and renders safely with empty or zero data.

## Phase 7: Budget Management

### 7.1 Budget model and API

- [x] Create the budget entity with UUID ID, decimal amount, month, year, and timestamps.
- [x] Add user and optional category relationships as required by the product rules.
- [x] Add uniqueness constraints for user, category, month, and year combinations.
- [x] Add indexes for user and period queries.
- [x] Implement budget list, create, update, and delete endpoints.
- [x] Validate positive amount and valid month/year values.
- [x] Calculate spent, remaining, and usage percentage from expense transactions.
- [x] Make warning thresholds configurable.

### 7.2 Budget frontend

- [x] Build the budgets list and creation/edit form.
- [x] Show budget amount, spent amount, remaining amount, and usage percentage.
- [x] Add normal, warning, high-usage, and exceeded visual states.
- [x] Add period and category filters.
- [x] Reuse shared progress, badge, form, and state components.

### 7.3 Phase 7 verification

- [x] Test budget calculations at below 70%, 70-90%, above 90%, and above 100%.
- [x] Test duplicate budget rules.
- [x] Test user isolation.
- [x] Test configurable warning thresholds.

### 7.4 Frontend verification

- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Verify the `/budgets` route compiles and serves through Next.js.
- [x] Verify TypeScript diagnostics are clean.

**Current status:** Phase 7 is complete end-to-end. `Budgets` (nullable `CategoryId` for a total/"all expenses" budget, `numeric(14,2)` amount, `Month`/`Year`, UTC timestamps) has a `Restrict`-behavior FK to `Categories` and two partial unique indexes — one for `(UserId, CategoryId, Month, Year)` where `CategoryId IS NOT NULL`, one for `(UserId, Month, Year)` where `CategoryId IS NULL` — so a user can hold at most one budget per category per month, and at most one total budget per month, without blocking multiple *different* categories in the same month. `GET/POST/PUT/DELETE /api/budgets` (list takes `month`, `year`, optional `categoryId`) all enforce ownership via the JWT-derived `UserId`, validate amount > 0 and month/year ranges, reject a `categoryId` that isn't the caller's own **expense**-type category, and return a clean `409` for a duplicate month/category combination instead of surfacing the database constraint. `spentAmount`/`remainingAmount`/`usagePercentage` are computed live from `ExpenseTransactions` for the budget's month (summed across all categories for a total budget, or scoped to the one category otherwise); the frontend's existing 70/90/100 thresholds in `src/config/budget.ts` classify that percentage into normal/warning/high/exceeded, so thresholds stay configurable without a backend change. `CategoryService.DeleteAsync` also now blocks deleting a category that still has a budget. Verified live: create/update/delete, duplicate-total and duplicate-category-per-month rejected with `409`, usage at 0%/95%/115% (below-warning, high, exceeded) computed correctly, and a second user's budget list/mutations stay fully isolated (empty list, `404` on update/delete of another user's budget).

**Exit criteria:** Users can manage monthly budgets and see accurate, configurable usage information.

## Phase 8: Reports

### 8.1 Report calculations and API

- [x] Define monthly and custom date-range report contracts.
- [x] Implement total income, total expenses, net balance, savings, and savings rate.
- [x] Implement income and expense breakdowns.
- [x] Calculate the highest expense category.
- [x] Add budget performance to reports.
- [x] Add month-over-month comparisons.
- [x] Add category filtering.
- [x] Ensure report queries remain user-scoped and use efficient database queries.

### 8.2 Reports frontend

- [x] Build the reports route and period selectors.
- [x] Display summary metrics and breakdown tables/charts.
- [x] Add month-over-month comparison views.
- [x] Add loading, empty, and error states.
- [x] Defer PDF and CSV export until the core report is stable.

### 8.3 Phase 8 verification

- [x] Compare report results with dashboard and transaction fixtures.
- [x] Test month boundaries, custom ranges, and empty periods.
- [x] Test category filtering and user isolation.

### 8.4 Frontend verification

- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Verify the `/reports` route compiles and serves through Next.js.
- [x] Verify TypeScript diagnostics are clean.

**Current status:** Phase 8 is complete end-to-end. `GET /api/reports/summary?from=&to=&categoryId=` is user-scoped via the JWT-derived `UserId` and computes, purely from `IncomeTransactions`/`ExpenseTransactions` (no persisted report data): total income, total expenses (optionally narrowed to one expense category via `categoryId`, which also narrows the expense breakdown and highest-expense-category), net balance, savings, a zero-income-guarded savings rate, income/expense breakdowns by category with percentages, the highest expense category, budget performance for every `Budget` whose month overlaps the requested range (spent recomputed for that budget's own month/category), and a month-over-month comparison against the immediately preceding period — a full previous calendar month when the request is exactly one calendar month, otherwise an equal-length preceding window, with percentage changes guarded against a zero previous value. `periodLabel`/`comparison.previousPeriodLabel` render as `"September 2026"` for a full month or `"1 Sep 2026 – 15 Sep 2026"` otherwise. Verified live: totals match fixtures created directly against the API; an empty historical period (e.g. January 2019) returns all zeros/nulls without error; the `categoryId` filter correctly excludes other categories' expenses from totals and breakdowns while leaving income untouched; a second user's report for the same date range returns all zeros despite the first user's data in that period.

**Exit criteria:** Reports provide consistent, reproducible summaries that agree with dashboard calculations.

## Phase 9: Financial Advisor Insights

### 9.1 Rule engine

- [x] Define a small rule interface with input summary, condition, and output insight.
- [x] Implement the negative balance rule.
- [x] Implement the low savings-rate rule.
- [x] Implement significant category-increase detection.
- [x] Implement budget-exceeded detection.
- [x] Implement expense-decrease detection.
- [x] Keep thresholds configurable and documented.
- [x] Include the relevant period and category in each insight.

### 9.2 Advisor presentation

- [x] Add an insights section to the dashboard or reports view.
- [x] Display severity consistently and accessibly.
- [x] Show the calculation period and related category where applicable.
- [x] Use neutral language and include a non-regulated-advice disclaimer.
- [x] Do not add AI or unrestricted database access in this phase.

### 9.3 Phase 9 verification

- [ ] Unit-test every rule with matching and non-matching inputs.
- [ ] Test boundary values around savings and budget thresholds.
- [ ] Test multiple simultaneous insights.
- [ ] Verify insights never modify transactions or budgets.

### 9.4 Frontend verification

- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Verify the dashboard insight panel compiles and serves through Next.js.
- [x] Verify TypeScript diagnostics are clean.

**Current status:** Deterministic frontend insight rules and the severity-aware dashboard presentation are implemented and build-verified. Automated rule tests and live summary behavior require the project test runner and backend API data.

**Exit criteria:** The application provides explainable, deterministic insights based only on calculated summaries.

## Phase 10: Polishing and Release Readiness

### 10.1 UX and accessibility

- [x] Verify responsive behavior for mobile, tablet, and desktop.
- [x] Add complete loading, empty, error, and success states.
- [x] Verify keyboard navigation and visible focus states.
- [x] Verify form labels, validation messages, table semantics, and chart accessibility.
- [x] Confirm text and controls do not overlap at supported widths.

### 10.2 Security review

- [x] Confirm frontend secrets are environment-only and absent from source files.
- [ ] Review JWT expiry and configuration handling.
- [ ] Review CORS origins and production settings.
- [ ] Review authorization and user ownership checks for every endpoint.
- [ ] Review DTOs for over-posting and sensitive-field exposure.
- [ ] Review production error responses for stack traces and database details.
- [ ] Review validation and SQL query behavior.

### 10.3 Performance and maintainability

- [ ] Review database indexes and common query plans.
- [ ] Avoid unnecessary frontend requests and duplicate data fetching.
- [x] Review component boundaries and duplicated UI logic.
- [ ] Review API response consistency.
- [x] Remove unused starter assets and scan for stale references.
- [x] Update the development checklist with Phase 10 frontend status.

### 10.4 Final verification

- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [ ] Run backend build and tests.
- [ ] Run integration checks against a test database.
- [ ] Verify migrations can create a clean database.
- [ ] Verify the application can switch between local PostgreSQL and Neon through configuration.
- [ ] Review the final git diff and confirm no secrets or unrelated changes are included.

### 10.5 Frontend verification

- [x] Run `npm audit --omit=dev` with zero production vulnerabilities.
- [x] Verify TypeScript diagnostics are clean.
- [x] Verify `git diff --check` reports no code whitespace errors.
- [x] Verify create-next-app asset references are absent from `src`.
- [x] Add shared Button, Input, Select, Table, Modal, EmptyState, LoadingState, and ErrorState primitives.
- [x] Add root loading, error, and not-found route boundaries.
- [x] Add reduced-motion support and visible keyboard focus states.

**Current status:** Phase 10 frontend polish is complete and build-verified. Backend security review, integration tests, migrations, and production database switching remain backend/release-environment checks.

**Exit criteria:** The MVP is documented, testable, secure at its intended scope, responsive, and ready for the next feature without architectural rework.

## Recommended Task Order

1. Complete Phase 1 frontend and backend foundation.
2. Complete Phase 2 authentication before creating user-owned data.
3. Complete Phase 3 categories before income and expenses.
4. Complete Phases 4 and 5 independently, then compare their shared patterns.
5. Complete Phase 6 dashboard calculations before charts and insights.
6. Complete Phase 7 budgets before budget usage appears in dashboard or reports.
7. Complete Phase 8 reports using the already verified calculation contracts.
8. Complete Phase 9 rule-based insights using report/dashboard summaries.
9. Complete Phase 10 only after all core workflows are stable.
