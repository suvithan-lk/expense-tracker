# Architecture Overview

## High-level diagram

```
[Next.js App Router client] --HTTPS (JSON, Bearer JWT)--> [ASP.NET Core 10 Minimal API] --EF Core / Npgsql--> [PostgreSQL]
```

There is no separate cache, queue, object store, or email service in the current implementation — every request is either served directly from PostgreSQL or is a pure calculation over data already in PostgreSQL. See [`docs/07-roadmap.md`](07-roadmap.md) for where those would come in (recurring transactions, receipt uploads, email notifications).

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, React Hook Form + Zod, Recharts |
| Backend | ASP.NET Core 10 Minimal APIs (no MVC controllers, no MediatR/CQRS) |
| Data access | EF Core 10 + Npgsql, one `AppDbContext`, fluent `IEntityTypeConfiguration<T>` per entity |
| Database | PostgreSQL 18 (local) or Neon (managed) |
| Auth | Hand-rolled JWT bearer access tokens + server-persisted, rotating refresh tokens (no external identity provider) |
| Infra | Docker multi-stage builds for both apps, GitHub Actions CI (lint/typecheck/build) |

## Design principles

1. **Minimal APIs, not layers for their own sake.** Each domain (`Auth`, `Categories`, `Income`, `Expenses`, `Budgets`, `Dashboard`, `Reports`) is a self-contained vertical slice: an `*Endpoints.cs` file maps routes, a `Service`/`IService` pair holds the business logic, and a small set of DTOs defines the wire contract. There is no repository layer wrapping EF Core, no CQRS mediator, and no generic base classes — `IncomeService` and `ExpenseService` are intentionally near-identical rather than forced through a shared abstraction (see the note in [`docs/07-development-plan.md`](07-development-plan.md#phase-5-expense-management) for why).
2. **DTOs at every boundary.** Endpoints never accept or return EF entities directly — every request/response has an explicit record type in `DTOs/`, so adding a column to a table never accidentally changes the API contract.
3. **One error model.** Four typed exceptions (`ValidationAppException`, `ConflictAppException`, `NotFoundAppException`, `UnauthorizedAppException`) are the only way a service reports failure. `Middleware/ExceptionHandlingMiddleware.cs` maps them to HTTP status codes and a consistent `{ message, errors }` body exactly once, so no endpoint hand-rolls its own error response — and anything unmapped becomes a generic `500` with no stack trace leaked outside development.
4. **User scoping is structural, not incidental.** The caller's id is extracted from the JWT's `sub` claim in every endpoint and passed into the service as an explicit parameter; every query filters on it. No endpoint accepts a user id from the route, query string, or body.
5. **Feature-based frontend, not atomic-design.** `src/components` is organized by feature (`income/`, `budgets/`, `reports/`, …) plus a small shared `ui/` and `common/` layer — mirroring the backend's vertical slices rather than a generic atoms/molecules hierarchy.

## Request lifecycle (example: creating an expense)

1. Browser holds a JWT access token in `localStorage`; `src/lib/api/client.ts` attaches it as `Authorization: Bearer <token>` on every request.
2. `POST /api/expenses` hits `ExpenseEndpoints`, which reads the user id from `ClaimsPrincipal` and calls `IExpenseService.CreateAsync`.
3. `ExpenseService` validates the payload, confirms the referenced category belongs to the caller and is an expense category, persists via `AppDbContext`, and returns an `ExpenseTransactionResponse` DTO.
4. If the access token is expired, the API returns `401`; the frontend client transparently calls `POST /api/auth/refresh` once (de-duplicated across concurrent requests), retries the original call with the new token, and only redirects to `/login` if the refresh token itself is invalid. See [`docs/04-auth-flow.md`](04-auth-flow.md).
5. Any failure (validation, ownership, conflict) throws one of the four typed exceptions and is turned into a consistent JSON error by the single exception-handling middleware — the endpoint method itself never writes an error response.
