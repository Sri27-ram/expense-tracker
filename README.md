# Expense Tracker

A full-stack personal expense tracker: log income and expenses, categorize them, and see a monthly breakdown.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Auth | JWT (jsonwebtoken), bcryptjs |
| ORM | Prisma |
| Database | PostgreSQL |
| Frontend | React (Vite) |
| Testing | Jest, Supertest |

## Features

- JWT authentication (register, login)
- Log income and expense transactions (amount, category, description, date)
- Filter transactions by month, category, or type
- Monthly summary: total income, total expense, balance, spending by category

## Project Structure

```
expense-tracker/
├── backend/    Express API (Prisma + PostgreSQL)
└── frontend/   React app (Vite)
```

## Quick Start

### 1. Database

Create a PostgreSQL database and user:

```sql
CREATE DATABASE expensetracker;
CREATE USER expensetracker WITH PASSWORD 'expensetracker';
GRANT ALL PRIVILEGES ON DATABASE expensetracker TO expensetracker;
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # edit DATABASE_URL / JWT_SECRET if needed
npx prisma migrate dev
npm run dev
```

API runs at http://localhost:4000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register a new user | No |
| POST | /api/auth/login | Login and get JWT | No |
| GET | /api/transactions | List transactions (filter by month/category/type) | Yes |
| POST | /api/transactions | Create a transaction | Yes |
| PUT | /api/transactions/:id | Update a transaction | Yes |
| DELETE | /api/transactions/:id | Delete a transaction | Yes |
| GET | /api/transactions/summary | Monthly totals and category breakdown | Yes |

## Running Tests

```bash
cd backend
npm test
```

## License

MIT
