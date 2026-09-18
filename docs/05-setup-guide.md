# Local Setup

## Prerequisites
- Node.js 24.x, .NET SDK 10.0.401, PostgreSQL 18 (local or Neon), Docker Desktop (optional)

## 1. Clone
git clone <repo> && cd financial-advisor-web

## 2. Docker (easiest)
JWT_KEY=$(openssl rand -base64 48) docker compose up --build
# Spins: postgres, api (migrates itself on startup), web

## 3. Manual Backend
cd Backend/FinancialAdvisor.Api
dotnet restore
cp ../.env.example ../.env
# edit ConnectionStrings__DefaultConnection and Jwt__Key, then export them
dotnet run
# migrations are applied automatically on startup

## 4. Manual Frontend
npm install
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5029
npm run dev

## 5. Default URLs
- Frontend : http://localhost:3000
- API      : http://localhost:5029
- Health   : http://localhost:5029/api/health