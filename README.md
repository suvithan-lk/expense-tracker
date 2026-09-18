# Folia

**A calm, practical personal finance workspace.** Track income and expenses, plan monthly budgets, and see where your money actually goes — with rule-based insights that explain themselves instead of pretending to be a robo-advisor.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt=".NET" src="https://img.shields.io/badge/.NET-10-512BD4?logo=dotnet&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white">
</p>

---

## Table of contents

- [Why Folia](#why-folia)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
  - [Option A — Docker](#option-a--docker-fastest)
  - [Option B — Manual](#option-b--manual-setup)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Security](#security)
- [Documentation](#documentation)
- [Roadmap](#roadmap)

## Why Folia

Most budgeting apps either drown you in categories or oversimplify into a single "you're doing fine" number. Folia sits in between: every number on the dashboard is a plain calculation over your own transactions, traced back to a category and a date range, with a one-line explanation of *why* it's flagged — never a black-box recommendation.

Built as a full-stack reference implementation: a Next.js App Router frontend talking to a from-scratch ASP.NET Core 10 Minimal API, backed by PostgreSQL via EF Core, with real JWT + rotating-refresh-token authentication rather than a third-party auth provider.

## Features

**Accounts & security**
- Email/password registration and login with per-user data isolation
- Short-lived JWT access tokens with rotating, server-revocable refresh tokens (stolen-token replay is detected and blocked)
- Passwords hashed with a slow adaptive hash, never returned in any response

**Income & expenses**
- Full CRUD with pagination, sorting, free-text search, category and date-range filters
- User-defined categories seeded with sensible defaults on signup, with safe-delete (blocked while transactions or budgets still reference a category)

**Budgets**
- Per-category or whole-of-month ("all expenses") budgets
- Live spent / remaining / usage % computed from real transactions — not a cached snapshot
- Configurable normal → warning → high-usage → exceeded thresholds

**Dashboard & reports**
- Current month / previous month / custom date-range views
- Income vs. expense trend, spending-by-category breakdown, recent activity feed
- Standalone reports view with month-over-month comparison and budget performance, filterable by category

**Insights**
- Deterministic rule engine (negative balance, low savings rate, category spend spikes, budget overruns) — every insight names its period, category, and the plain-language reason it fired
- Explicitly labelled as calculated observations, not financial advice

## Tech stack

| Layer | Choices |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, React Hook Form + Zod, Recharts |
| **Backend** | ASP.NET Core 10 Minimal APIs, EF Core 10, Npgsql |
| **Database** | PostgreSQL 18 (local or [Neon](https://neon.tech)) |
| **Auth** | JWT bearer access tokens + SHA-256-hashed, rotating refresh tokens |
| **Infra** | Docker multi-stage builds, GitHub Actions CI (lint, typecheck, build) |

## Architecture

```
┌─────────────────────┐        JSON / JWT        ┌──────────────────────────┐        SQL        ┌──────────────┐
│   Next.js frontend   │ ───────────────────────▶ │   ASP.NET Core 10 API    │ ─────────────────▶│  PostgreSQL  │
│  (App Router, RSC)   │ ◀─────────────────────── │      (Minimal APIs)      │ ◀──────────────────│   (EF Core)  │
└─────────────────────┘                          └──────────────────────────┘                    └──────────────┘
     localStorage                                  centralized exception            migrations run
    (access + refresh                              middleware → consistent          automatically on
        tokens)                                    { data, message } envelope         API startup
```

- **Feature-sliced backend** — each domain (`Auth`, `Categories`, `Income`, `Expenses`, `Budgets`, `Dashboard`, `Reports`) owns its own endpoints, service, and DTOs under `Backend/FinancialAdvisor.Api/Features` and `Services`, all sharing one `AppDbContext`.
- **Every query is user-scoped.** The caller's id comes from the JWT, never from a route or body parameter — there is no endpoint that trusts a client-supplied user id.
- **Centralized error shape.** A small hierarchy of typed exceptions (`ValidationAppException`, `ConflictAppException`, `NotFoundAppException`, `UnauthorizedAppException`) is mapped once, in one middleware, to the appropriate HTTP status and a consistent JSON body.

Full write-up: [`docs/01-architecture.md`](docs/01-architecture.md).

## Project structure

```
financial-advisor-web/
├── src/
│   ├── app/                 # Next.js routes (dashboard, income, expenses, budgets, reports, settings, auth)
│   ├── components/          # UI organized by feature + shared primitives (ui/, common/, layout/)
│   ├── lib/                 # API clients, auth session handling, formatting utilities
│   ├── config/               # Tunable constants (e.g. budget thresholds)
│   └── types/                # Shared frontend domain types
├── Backend/
│   └── FinancialAdvisor.Api/
│       ├── Features/         # Endpoint definitions, grouped by domain
│       ├── Services/         # Business logic, one interface + implementation per domain
│       ├── Models/           # EF Core entities
│       ├── Data/             # DbContext + fluent configurations + migrations
│       └── DTOs/              # Request/response contracts, never the EF entities directly
├── docs/                     # Architecture, schema, API contracts, auth flow, setup, roadmap
├── docker-compose.yml
└── Dockerfile                # Frontend image (backend has its own under Backend/FinancialAdvisor.Api)
```

## Getting started

### Prerequisites

- Node.js 24.x
- .NET SDK 10.0.401
- PostgreSQL 18 (local install or a [Neon](https://neon.tech) connection string)
- Docker Desktop (optional, for the one-command path)

### Option A — Docker (fastest)

```bash
JWT_KEY=$(openssl rand -base64 48) docker compose up --build
```

This starts PostgreSQL, the API (which applies EF Core migrations automatically on startup), and the frontend.

- Frontend: http://localhost:3000
- API health check: http://localhost:5029/api/health

### Option B — Manual setup

```bash
# 1. Backend
cd Backend/FinancialAdvisor.Api
cp ../.env.example ../.env   # fill in a real Jwt__Key and your Postgres credentials
dotnet restore
dotnet run                    # migrations are applied automatically on startup

# 2. Frontend (in a separate terminal, from the repo root)
npm install
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:5029
npm run dev
```

Then open http://localhost:3000, create an account, and start tracking.

## Environment variables

**`Backend/.env`** (backend)

| Variable | Description |
|---|---|
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string |
| `Jwt__Key` | Signing key for access tokens — generate with `openssl rand -base64 48` |
| `Jwt__Issuer` / `Jwt__Audience` | JWT issuer/audience claims |
| `Jwt__ExpiryMinutes` | Access token lifetime (default `60`) |
| `Jwt__RefreshTokenExpiryDays` | Refresh token lifetime (default `30`) |
| `Cors__AllowedOrigins__0` | Frontend origin allowed to call the API |

**`.env.local`** (frontend)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |

## API overview

All endpoints (except `/api/health`, `/api/auth/*`) require a `Bearer` JWT and are scoped to the authenticated user.

| Domain | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me` |
| **Categories** | `GET/POST /api/categories`, `PUT/DELETE /api/categories/{id}` |
| **Income** | `GET/POST /api/income`, `GET/PUT/DELETE /api/income/{id}` (paginated, filterable, sortable) |
| **Expenses** | `GET/POST /api/expenses`, `GET/PUT/DELETE /api/expenses/{id}` (paginated, filterable, sortable) |
| **Budgets** | `GET/POST /api/budgets`, `PUT/DELETE /api/budgets/{id}` |
| **Dashboard** | `GET /api/dashboard/summary?period=` |
| **Reports** | `GET /api/reports/summary?from=&to=&categoryId=` |

Full contracts and request/response shapes: [`docs/03-api-contracts.md`](docs/03-api-contracts.md).

## Security

- Passwords hashed with a slow, salted adaptive hash — never logged or returned
- Access tokens are short-lived; refresh tokens are opaque random values, stored server-side only as a SHA-256 hash, and **rotated on every use** — a replayed (already-used) refresh token is rejected and the session is treated as compromised
- Every read/write is filtered by the JWT-derived user id at the query level — no endpoint trusts a client-supplied id
- CORS is explicitly allow-listed per environment, never wildcarded
- Centralized exception handling ensures production responses never leak stack traces or database details

## Documentation

| Doc | Covers |
|---|---|
| [`docs/01-architecture.md`](docs/01-architecture.md) | System design and component responsibilities |
| [`docs/02-database-schema.md`](docs/02-database-schema.md) | Entity relationships and constraints |
| [`docs/03-api-contracts.md`](docs/03-api-contracts.md) | Request/response contracts |
| [`docs/04-auth-flow.md`](docs/04-auth-flow.md) | Registration, login, refresh, and logout flow |
| [`docs/05-setup-guide.md`](docs/05-setup-guide.md) | Local setup, Docker, and manual paths |
| [`docs/06-folder-structure.md`](docs/06-folder-structure.md) | Directory conventions |
| [`docs/07-development-plan.md`](docs/07-development-plan.md) | Phase-by-phase build log with verification notes |

## Roadmap

Tracked in [`docs/07-roadmap.md`](docs/07-roadmap.md). Shipped: foundation, auth (with refresh), core CRUD, analytics, and budgeting. Still open: recurring transactions, receipt uploads, CSV/PDF export, email notifications, and production hardening (caching, structured logging, integration/E2E tests, deployment).

---

*Folia performs transparent calculations over data you enter — it is not a licensed financial advisor and does not provide regulated financial advice.*
