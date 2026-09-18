# Development Roadmap

## Phase 1 — Foundation (Week 1–2)
- [x] Repo setup, Docker, CI skeleton
- [x] PostgreSQL + EF Core entities + migrations
- [x] Auth (register/login/refresh) end-to-end
- [x] Next.js shell + login/register UI

## Phase 2 — Core CRUD (Week 3–4)
- [ ] Accounts, Categories, Transactions APIs
- [ ] Dashboard with totals + recent transactions
- [ ] Filter/pagination in transactions list

## Phase 3 — Analytics (Week 5)
- [x] Summary endpoints (monthly/yearly)
- [x] Charts: pie (by category), bar (monthly), line (trend)
- [x] Budgets + alerts

## Phase 4 — Advanced (Week 6–7)
- [ ] Recurring transactions (Hangfire)
- [ ] Receipt upload → S3
- [ ] CSV / PDF export
- [ ] Email notifications

## Phase 5 — Polish (Week 8)
- [ ] Redis caching, rate limiting
- [ ] Serilog + Seq, health checks
- [ ] Integration tests, E2E (Playwright)
- [ ] Deploy: Vercel (FE) + Fly.io/Railway (BE) + Neon (DB)