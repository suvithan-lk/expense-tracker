# PROJECT: Personal Financial Advisor

You are a senior full-stack software engineer and solution architect.

I am building a personal finance management and financial advisor web application for tracking income, expenses, budgets, savings, and financial health.

The application should be simple, clean, professional, maintainable, and scalable.

This is primarily a learning + real-world portfolio project, so code quality, architecture, security, database design, API design, and maintainability are more important than rushing features.

==================================================
1. CORE OBJECTIVE
==================================================

Build a full-stack personal financial management application that allows a user to:

- Register and login
- Track income
- Track expenses
- Manage income categories
- Manage expense categories
- Create monthly budgets
- Monitor spending
- Monitor savings
- View financial summaries
- Analyze spending patterns
- View monthly financial reports
- Receive rule-based financial insights/recommendations

The application should eventually behave like a lightweight personal financial advisor.

Do NOT make it an investment-trading application.

Do NOT provide regulated financial advice.

The "financial advisor" functionality should initially be based on transparent calculations and configurable rules.

==================================================
2. TECHNOLOGY STACK
==================================================

Frontend:

- Next.js 16
- React
- TypeScript
- App Router
- Tailwind CSS
- ESLint
- Recharts
- Zod
- React Hook Form

Backend:

- ASP.NET Core 10
- Minimal API
- C#
- Entity Framework Core 10
- Npgsql

Database:

- PostgreSQL 18
- Neon PostgreSQL

Authentication:

- JWT authentication
- Secure password hashing
- Protected API endpoints
- User-specific data isolation

Development:

- Git
- GitHub
- npm
- .NET CLI

Do not introduce another backend framework unless explicitly requested.

Do not replace ASP.NET Core with Node.js, Express, Laravel, Firebase, Supabase, Prisma, etc.

Do not replace PostgreSQL with MySQL or MongoDB.

==================================================
3. PROJECT STRUCTURE
==================================================

The repository should follow this structure:

financial-advisor/
│
├── backend/
│   └── FinancialAdvisor.Api/
│
├── frontend/
│   └── financial-advisor-web/
│
├── docs/
│   ├── 01-project-overview.md
│   ├── 02-requirements.md
│   ├── 03-architecture.md
│   ├── 04-database-design.md
│   ├── 05-api-specification.md
│   ├── 06-coding-rules.md
│   └── 07-development-plan.md
│
├── .gitignore
└── README.md

Frontend structure:

src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── dashboard/
│   ├── income/
│   ├── expenses/
│   ├── budgets/
│   ├── reports/
│   └── settings/
│
├── components/
│   ├── charts/
│   ├── common/
│   ├── layout/
│   └── ui/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── income/
│   ├── expenses/
│   ├── budgets/
│   └── reports/
│
├── hooks/
├── lib/
│   ├── api/
│   ├── auth/
│   └── utils/
│
├── types/
└── config/

Backend structure:

FinancialAdvisor.Api/
├── Features/
│   ├── Auth/
│   ├── Users/
│   ├── Income/
│   ├── Expenses/
│   ├── Categories/
│   ├── Budgets/
│   ├── Dashboard/
│   └── Reports/
│
├── Data/
│   ├── AppDbContext.cs
│   └── Configurations/
│
├── Models/
├── DTOs/
├── Services/
├── Common/
├── Middleware/
├── Program.cs
└── appsettings.json

Keep the architecture simple.

Do not over-engineer the application with unnecessary enterprise patterns.

==================================================
4. USER AUTHENTICATION
==================================================

Implement:

- User registration
- User login
- JWT token generation
- Password hashing
- Authenticated API requests
- Logout
- Protected frontend routes

User fields:

- Id
- Name
- Email
- PasswordHash
- CreatedAt
- UpdatedAt

Requirements:

- Email must be unique.
- Password must never be stored as plain text.
- Password hashing must use a secure industry-standard approach.
- JWT secret must come from environment configuration.
- Never hardcode secrets.
- Authenticated users must only access their own financial data.

Example:

User A must never be able to request User B's income or expenses.

==================================================
5. DATABASE DESIGN
==================================================

Initial entities:

Users

IncomeCategories

ExpenseCategories

IncomeTransactions

ExpenseTransactions

Budgets

The database should use:

- UUID identifiers
- PostgreSQL numeric/decimal values for money
- UTC timestamps
- Foreign key constraints
- Appropriate indexes
- NOT NULL where appropriate
- Unique constraints where appropriate

Suggested structure:

Users
- Id
- Name
- Email
- PasswordHash
- CreatedAt
- UpdatedAt

IncomeCategories
- Id
- UserId
- Name
- CreatedAt
- UpdatedAt

ExpenseCategories
- Id
- UserId
- Name
- CreatedAt
- UpdatedAt

IncomeTransactions
- Id
- UserId
- CategoryId
- Amount
- Description
- IncomeDate
- CreatedAt
- UpdatedAt

ExpenseTransactions
- Id
- UserId
- CategoryId
- Amount
- Description
- ExpenseDate
- CreatedAt
- UpdatedAt

Budgets
- Id
- UserId
- CategoryId
- Amount
- Month
- Year
- CreatedAt
- UpdatedAt

Use proper EF Core relationships.

Do not use floating-point types for monetary values.

Use decimal/numeric.

==================================================
6. DEFAULT CATEGORIES
==================================================

When a new user registers, create sensible default categories.

Income:

- Salary
- Freelance
- Business
- Investment
- Other Income

Expenses:

- Food
- Transport
- Housing
- Utilities
- Internet
- Mobile
- Health
- Education
- Shopping
- Entertainment
- Debt Payment
- Other

Users should be able to:

- Add categories
- Rename categories
- Delete categories where safe
- View categories

Do not allow deletion of a category if existing transactions depend on it unless there is a safe reassignment strategy.

==================================================
7. INCOME MANAGEMENT
==================================================

Users can:

- Add income
- Edit income
- Delete income
- View income
- Filter income
- Search income
- Sort income
- Filter by date
- Filter by category

Income fields:

- Amount
- Category
- Description
- Date

Validation:

- Amount > 0
- Category required
- Date required
- Description optional
- Maximum reasonable description length

API examples:

GET    /api/income
GET    /api/income/{id}
POST   /api/income
PUT    /api/income/{id}
DELETE /api/income/{id}

==================================================
8. EXPENSE MANAGEMENT
==================================================

Users can:

- Add expense
- Edit expense
- Delete expense
- View expenses
- Search expenses
- Filter by category
- Filter by date
- Sort by date
- Sort by amount

Expense fields:

- Amount
- Category
- Description
- Date

Validation:

- Amount > 0
- Category required
- Date required
- Description optional

API examples:

GET    /api/expenses
GET    /api/expenses/{id}
POST   /api/expenses
PUT    /api/expenses/{id}
DELETE /api/expenses/{id}

==================================================
9. DASHBOARD
==================================================

The dashboard is the main screen.

Display:

- Total income
- Total expenses
- Current balance
- Savings amount
- Savings rate
- Monthly income
- Monthly expenses
- Budget usage

Example:

Balance = Total Income - Total Expenses

Savings Rate:

Savings Rate = (Income - Expenses) / Income * 100

Handle division by zero safely.

Dashboard should support:

- Current month
- Previous month
- Custom date range

Charts:

1. Income vs Expense
2. Expense by Category
3. Monthly spending trend
4. Savings trend

Use Recharts.

Charts should be responsive and accessible.

==================================================
10. BUDGET MANAGEMENT
==================================================

Users can create budgets.

Examples:

Monthly food budget:
50,000 LKR

Monthly transport budget:
15,000 LKR

Monthly total budget:
150,000 LKR

Features:

- Create budget
- Edit budget
- Delete budget
- View budget
- Category budget
- Monthly budget

Show:

Budget amount
Spent amount
Remaining amount
Percentage used

Example:

Budget = 50,000
Spent = 35,000
Remaining = 15,000
Usage = 70%

Warning levels should be configurable.

Example:

< 70% → normal
70–90% → warning
> 90% → high usage
> 100% → exceeded

Do not hardcode UI assumptions into backend business logic.

==================================================
11. FINANCIAL INSIGHTS
==================================================

Create a rule-based financial insights system.

Do not use AI initially.

Insights should be based on transparent calculations.

Examples:

If expenses > income:

"Your expenses are higher than your income for this period."

If savings rate < 10%:

"Your current savings rate is low."

If a category increased significantly:

"Your spending on Food increased compared with the previous month."

If budget usage > 100%:

"You have exceeded your budget for this category."

If expenses decrease:

"Your total expenses decreased compared with the previous month."

Insights should contain:

- Type
- Title
- Description
- Severity
- Related category if applicable
- Date/period

Avoid pretending that these rules are professional financial advice.

==================================================
12. REPORTS
==================================================

Provide monthly financial reports.

Report should include:

- Total income
- Total expenses
- Net balance
- Savings
- Savings rate
- Expense breakdown
- Income breakdown
- Highest expense category
- Budget performance
- Month-over-month comparison

Allow:

- Month selection
- Date range selection
- Category filtering

Later, PDF/CSV export can be added.

Do not implement export until the core report functionality is stable.

==================================================
13. SETTINGS
==================================================

Settings should include:

- User name
- Email
- Currency
- Default dashboard period
- Theme preference

Default currency:

LKR

The architecture should allow future currencies.

Do not hardcode currency formatting throughout the application.

Create a reusable currency formatting utility.

==================================================
14. FRONTEND UI
==================================================

Design style:

- Clean
- Minimal
- Professional
- Modern
- Financial dashboard style
- Responsive
- Desktop-first but mobile-friendly

Main layout:

Sidebar
Header
Main content

Sidebar navigation:

Dashboard
Income
Expenses
Budgets
Reports
Settings

Header:

- Page title
- User information
- Logout

Dashboard cards:

Income
Expenses
Balance
Savings Rate

Use reusable components.

Example:

Card
Button
Input
Select
Modal
Table
Badge
EmptyState
LoadingState
ErrorState
Pagination
DatePicker

Do not duplicate UI code.

==================================================
15. FRONTEND ROUTING
==================================================

Routes:

/login
/register

/dashboard
/income
/expenses
/budgets
/reports
/settings

Unauthenticated users should be redirected to:

/login

Authenticated users should be redirected to:

/dashboard

The root route `/` should redirect appropriately.

==================================================
16. API CLIENT
==================================================

Create a centralized API client.

Do not make raw fetch calls everywhere.

Example concept:

lib/api/client.ts

Provide:

- GET
- POST
- PUT
- DELETE

Handle:

- Authorization
- JSON
- API errors
- HTTP status codes
- Network errors

Backend URL should come from:

NEXT_PUBLIC_API_URL

Never hardcode:

http://localhost:xxxx

inside individual components.

==================================================
17. ENVIRONMENT VARIABLES
==================================================

Frontend:

NEXT_PUBLIC_API_URL=

Backend:

ConnectionStrings__DefaultConnection=

Jwt__Key=

Jwt__Issuer=

Jwt__Audience=

Never commit secrets.

Provide:

.env.example

Do not commit:

.env.local

or production secrets.

==================================================
18. API RESPONSE DESIGN
==================================================

Use consistent API responses.

Success example:

{
  "data": {},
  "message": "Success"
}

Validation errors should be structured.

Example:

{
  "message": "Validation failed",
  "errors": {
    "amount": [
      "Amount must be greater than zero."
    ]
  }
}

Use proper HTTP status codes.

Examples:

200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error

==================================================
19. VALIDATION
==================================================

Backend:

Validate all incoming DTOs.

Frontend:

Use React Hook Form + Zod where appropriate.

Never rely only on frontend validation.

The backend must always validate data.

==================================================
20. ERROR HANDLING
==================================================

Implement centralized backend error handling.

Do not expose:

- Stack traces
- Database details
- Internal exceptions
- Secrets

to the frontend in production.

Frontend should provide useful user-facing messages.

Examples:

"Unable to load expenses."

"Something went wrong while saving the transaction."

==================================================
21. SECURITY
==================================================

Follow basic production security practices.

Requirements:

- Password hashing
- JWT authentication
- User data isolation
- Input validation
- Authorization checks
- No secrets in source control
- SQL injection protection through EF Core
- Proper CORS configuration
- Secure error handling
- Avoid over-posting
- DTOs instead of exposing database entities directly

Never trust UserId sent from frontend.

The authenticated user identity must determine ownership.

==================================================
22. DATABASE / EF CORE
==================================================

Use:

EF Core 10
Npgsql
PostgreSQL 18

Use migrations.

Example workflow:

dotnet ef migrations add InitialCreate

dotnet ef database update

Do not manually create tables if EF migrations are being used.

Configure relationships explicitly.

Add indexes for common queries.

At minimum consider indexes for:

- UserId
- Transaction dates
- CategoryId
- Budget month/year

==================================================
23. NEON POSTGRESQL
==================================================

The application will use Neon PostgreSQL.

Do not hardcode the database connection string.

Use environment variables.

Development should support:

Local configuration

and

Neon PostgreSQL.

The application must be able to switch between environments through configuration.

==================================================
24. CODING RULES
==================================================

General:

- Write clean code.
- Prefer readable code over clever code.
- Use meaningful names.
- Keep functions small.
- Avoid unnecessary abstractions.
- Avoid duplicated logic.
- Do not create giant components.
- Do not create giant service classes.
- Keep features modular.

C#:

- Nullable reference types enabled.
- Async/await for database operations.
- Use cancellation tokens where appropriate.
- DTOs for API contracts.
- Avoid exposing EF entities directly.
- Use dependency injection.
- Use proper HTTP status codes.

TypeScript:

- Strict TypeScript.
- Avoid `any`.
- Define API response types.
- Define domain types.
- Reuse types where appropriate.
- Keep components focused.

==================================================
25. DOCUMENTATION
==================================================

Maintain the docs folder.

Required files:

01-project-overview.md
02-requirements.md
03-architecture.md
04-database-design.md
05-api-specification.md
06-coding-rules.md
07-development-plan.md

Update documentation when architecture or API contracts change.

Do not allow documentation to become outdated.

==================================================
26. DEVELOPMENT STRATEGY
==================================================

Build the application in phases.

PHASE 1:
Project foundation

- Repository
- Frontend
- Backend
- PostgreSQL/Neon
- EF Core
- Environment configuration
- Basic API health endpoint

PHASE 2:
Authentication

- Register
- Login
- JWT
- Protected API
- Protected frontend routes

PHASE 3:
Categories

- Default categories
- Category CRUD

PHASE 4:
Income

- Income CRUD
- Filtering
- Validation

PHASE 5:
Expenses

- Expense CRUD
- Filtering
- Validation

PHASE 6:
Dashboard

- Summary calculations
- Charts
- Monthly analysis

PHASE 7:
Budgets

- Budget CRUD
- Budget tracking
- Budget warnings

PHASE 8:
Reports

- Monthly reports
- Comparisons
- Category analysis

PHASE 9:
Financial Advisor

- Rule-based insights
- Spending warnings
- Savings insights
- Budget recommendations

PHASE 10:
Polishing

- Responsive UI
- Loading states
- Error states
- Empty states
- Security review
- Performance review
- Code cleanup
- Documentation

==================================================
27. IMPORTANT DEVELOPMENT RULE
==================================================

DO NOT implement the entire application in one step.

Work phase-by-phase.

Before implementing a phase:

1. Inspect the existing project.
2. Understand the current architecture.
3. Identify files that need to change.
4. Explain the implementation plan briefly.
5. Implement only the requested phase.
6. Run/build/test the affected code.
7. Fix errors.
8. Summarize what changed.
9. Update documentation if necessary.

Do not randomly restructure working code.

Do not overwrite existing functionality without a reason.

Do not install packages unless they are actually required.

==================================================
28. TESTING
==================================================

Backend:

Use automated tests for important business logic.

At minimum test:

- Registration
- Login
- Income calculations
- Expense calculations
- Balance calculation
- Savings rate
- Budget calculations
- Authorization/user isolation

Frontend:

Test important UI/business behavior where practical.

Always verify:

- npm run build
- npm run lint

Backend should compile successfully.

==================================================
29. DASHBOARD BUSINESS CALCULATIONS
==================================================

Use these definitions.

Total Income:

SUM(all income transactions)

Total Expenses:

SUM(all expense transactions)

Balance:

Total Income - Total Expenses

Savings:

Balance

Savings Rate:

if Total Income > 0:

((Total Income - Total Expenses) / Total Income) * 100

Otherwise:

0

Never produce NaN or Infinity.

==================================================
30. DATA OWNERSHIP
==================================================

Every financial record belongs to a user.

For every query:

Filter by authenticated UserId.

For every update/delete:

Verify that the record belongs to the authenticated user.

Example:

User A requests:

GET /api/expenses/{UserBExpenseId}

The API must not return User B's record.

Similarly:

User A must not be able to modify/delete User B's data.

==================================================
31. FUTURE FEATURES
==================================================

Design the system so these can be added later without major restructuring:

- Recurring income
- Recurring expenses
- Debt tracking
- Loan management
- Savings goals
- Emergency fund tracking
- Multiple accounts
- Bank account integration
- CSV import
- CSV export
- PDF reports
- Notifications
- Email reports
- AI-powered financial analysis
- Multi-currency support
- Mobile application

Do NOT implement these initially.

Keep the initial version focused.

==================================================
32. AI FINANCIAL ADVISOR — FUTURE
==================================================

AI functionality should NOT be implemented in the first MVP.

When AI is eventually added:

The AI should receive calculated financial summaries rather than unrestricted raw database access.

Example:

Monthly Income: 150,000 LKR
Monthly Expenses: 125,000 LKR
Savings Rate: 16.6%
Highest Category: Food
Food Spending: 35,000 LKR

The AI can then explain patterns and generate suggestions.

Do not allow AI to directly modify financial transactions.

==================================================
33. QUALITY REQUIREMENTS
==================================================

The final application should have:

- Clean architecture
- Consistent naming
- Strong typing
- Secure authentication
- Proper authorization
- Reliable database relationships
- Reusable frontend components
- Consistent API contracts
- Good error handling
- Responsive UI
- Maintainable code
- Clear documentation

Avoid:

- Spaghetti code
- Giant components
- Hardcoded URLs
- Hardcoded secrets
- Duplicate API logic
- Duplicate UI components
- Direct database access from frontend
- Exposing EF entities
- Trusting client-provided UserId
- Unnecessary dependencies
- Premature microservices
- Over-engineering

==================================================
34. CURRENT TASK
==================================================

First inspect the existing project structure.

The Next.js frontend has already been created.

Current frontend structure includes:

src/app/
src/components/
src/config/
src/features/
src/hooks/
src/lib/
src/types/

Do NOT recreate the Next.js application.

Do NOT delete the existing structure unnecessarily.

The immediate objective is to establish the frontend foundation:

1. Clean the default Next.js starter page.
2. Configure global styling.
3. Create the application layout.
4. Create sidebar navigation.
5. Create header.
6. Create reusable UI components.
7. Create dashboard shell.
8. Configure frontend environment variables.
9. Create centralized API client structure.
10. Keep the code ready for the ASP.NET Core backend.

Do not implement authentication, income CRUD, expense CRUD, or budgets yet unless explicitly requested.

After completing the foundation:

- Run lint.
- Run production build.
- Fix all errors.
- Report changed files.
- Report commands used.
- Report any remaining issues.

Wait for the next instruction before implementing the next phase.

==================================================
END OF PROJECT SPECIFICATION
==================================================