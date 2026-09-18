# Folder Structure

## Frontend — `src/`

```
src/
├── app/                        # Next.js App Router — one folder per route
│   ├── (auth)/login/, (auth)/register/
│   ├── dashboard/, income/, expenses/, budgets/, reports/, settings/
│   ├── layout.tsx, error.tsx, loading.tsx, not-found.tsx
│   └── page.tsx                 # public landing page
├── components/                  # organized by feature, mirroring the backend's vertical slices
│   ├── auth/                    # login/register form + shared auth page shell
│   ├── dashboard/, income/, expenses/, budgets/, reports/, settings/
│   ├── charts/                  # Recharts wrappers shared across dashboard/reports
│   ├── layout/                  # AppShell (route guard), Header, Sidebar
│   ├── common/                  # MetricCard and other cross-feature widgets
│   └── ui/                      # Button, Card, ProgressBar, StatusBadge — no feature knowledge
├── lib/
│   ├── api/client.ts             # single fetch wrapper: base URL, auth header, 401→refresh→retry
│   ├── auth/                     # session.ts (localStorage), api.ts (login/register/refresh/logout)
│   ├── income/, expenses/, budgets/, dashboard/, reports/, categories/  # one api.ts per backend resource
│   └── utils/                    # formatCurrency, etc.
├── config/                       # budget.ts (usage thresholds), navigation.ts
└── types/                        # one file per domain, matching the backend DTOs by hand (no codegen)
```

Each `lib/<resource>/api.ts` is a thin, typed wrapper around `apiClient` — components never call `fetch` directly, and the API base URL only ever appears in `lib/api/client.ts`.

## Backend — `Backend/FinancialAdvisor.Api/`

```
Backend/FinancialAdvisor.Api/
├── Program.cs                    # composition root: config binding, DI, middleware pipeline, route mapping
├── Features/                     # one folder per domain — just the endpoint mappings
│   ├── Auth/AuthEndpoints.cs
│   ├── Categories/CategoryEndpoints.cs
│   ├── Income/IncomeEndpoints.cs
│   ├── Expenses/ExpenseEndpoints.cs
│   ├── Budgets/BudgetEndpoints.cs
│   ├── Dashboard/DashboardEndpoints.cs
│   └── Reports/ReportEndpoints.cs
├── Services/                     # business logic — one IXService/XService pair per domain, same names as Features/
├── DTOs/                         # request/response records, one subfolder per domain, never the EF entities
├── Models/                       # EF Core entities: User, RefreshToken, Category, IncomeTransaction,
│                                  # ExpenseTransaction, Budget, CategoryType (enum)
├── Data/
│   ├── AppDbContext.cs
│   ├── Configurations/           # one IEntityTypeConfiguration<T> per entity — indexes, FKs, column types live here, not in Models/
│   └── Migrations/               # EF Core migrations, applied automatically at startup (Program.cs)
├── Common/                       # ApiResponse<T>, typed exceptions, PagedResult<T>, SortSpec/Paging helpers, JwtOptions, CorsOptions, DefaultCategories
├── Middleware/
│   └── ExceptionHandlingMiddleware.cs   # the only place exceptions become HTTP responses
└── Dockerfile
```

**Naming convention:** a domain's endpoint file, service interface/implementation, and DTO folder all share the domain's name (`Budgets` → `BudgetEndpoints.cs`, `IBudgetService`/`BudgetService`, `DTOs/Budgets/`). Finding "everything about budgets" never requires a folder-structure diagram once you know that rule.

There is deliberately no `Controllers/`, `Repositories/`, or `Application`/`Domain`/`Infrastructure` project split — with seven small, mostly independent domains and one database, Minimal APIs plus a flat service layer is less machinery to maintain than Clean Architecture would be, without losing the DTO boundary or the single error-handling seam.
