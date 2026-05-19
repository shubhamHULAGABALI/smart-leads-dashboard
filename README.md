# Smart Leads Dashboard

A production-grade full-stack Lead Management System built with the MERN stack, TypeScript, and modern tooling.

---

## Tech Stack

| Layer     | Technology                                               |
|-----------|----------------------------------------------------------|
| Frontend  | React 18, TypeScript, Tailwind CSS, Framer Motion, Zustand, TanStack Query |
| Backend   | Node.js, Express, TypeScript, Mongoose                  |
| Database  | MongoDB                                                  |
| Auth      | JWT + bcrypt                                             |
| Infra     | Docker, Docker Compose, Nginx                           |

---

## Features

- **JWT Authentication** — Register / Login / Protected routes / Role-based access (Admin + Sales)
- **Lead Management** — Full CRUD with modal forms and detail drawer
- **Advanced Filtering** — Status, Source, debounced search, sort (latest/oldest)
- **Backend Pagination** — 10 records/page with full metadata
- **CSV Export** — Respects all active filters
- **Dark / Light Mode** — Persisted in localStorage with smooth transitions
- **Skeleton Loading & Empty States** — Production-quality UX
- **Responsive** — Works on mobile, tablet, and desktop

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repo
git clone <repo-url> && cd smart-leads

# 2. Copy environment files
cp .env.example .env

# 3. Start everything
docker-compose up --build

# App is live at http://localhost
```

### Option 2: Manual

#### Backend

```bash
cd backend

# Install dependencies
npm install

# Copy env
cp .env.example .env
# Edit .env: set MONGO_URI and JWT_SECRET

# Run in dev mode
npm run dev
# API available at http://localhost:5000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env
cp .env.example .env

# Run dev server
npm run dev
# App available at http://localhost:5173
```

> Make sure MongoDB is running locally (`mongod`) or point `MONGO_URI` to a cloud instance.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable        | Required | Default | Description                     |
|-----------------|----------|---------|---------------------------------|
| `NODE_ENV`      | No       | development | Runtime environment         |
| `PORT`          | No       | 5000    | HTTP port                       |
| `MONGO_URI`     | **Yes**  | —       | MongoDB connection string        |
| `JWT_SECRET`    | **Yes**  | —       | Secret for signing tokens        |
| `JWT_EXPIRES_IN`| No       | 7d      | Token expiry                    |
| `CLIENT_URL`    | No       | http://localhost:5173 | CORS origin      |

### Frontend (`frontend/.env`)

| Variable       | Default | Description          |
|----------------|---------|----------------------|
| `VITE_API_URL` | `/api`  | Backend API base URL |

---

## Project Structure

```
smart-leads/
├── backend/
│   └── src/
│       ├── config/         # DB connection
│       ├── controllers/    # Route handlers
│       ├── middleware/      # Auth + error middleware
│       ├── models/         # Mongoose models
│       ├── routes/         # Express routers
│       ├── services/       # Business logic
│       ├── types/          # Shared TypeScript types
│       ├── utils/          # Response helpers
│       ├── validators/     # express-validator chains
│       ├── app.ts          # Express app setup
│       └── server.ts       # Entry point
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── auth/       # ProtectedRoute
│       │   ├── common/     # StatCard, Pagination
│       │   ├── layout/     # Sidebar, Header, DashboardLayout
│       │   ├── leads/      # Table, Filter bar, Modals, Drawer
│       │   └── ui/         # Button, Input, Select, Badge, Skeleton, Dialog, EmptyState
│       ├── hooks/          # useLeads, useAuth, useDebounce
│       ├── pages/          # AuthPage, DashboardPage, LeadsPage
│       ├── services/       # API clients (axios)
│       ├── store/          # Zustand stores (auth, theme)
│       ├── types/          # Shared TS interfaces
│       └── utils/          # cn, formatters, status/source meta
│
├── docker-compose.yml
├── API_DOCS.md
└── README.md
```

---

## API Reference

See [API_DOCS.md](./API_DOCS.md) for full endpoint documentation.

---

## Role-Based Access Control

| Capability            | Admin | Sales User |
|-----------------------|-------|------------|
| View all leads        | ✅    | ❌ (own only) |
| Create lead           | ✅    | ✅           |
| Edit any lead         | ✅    | ❌ (own only) |
| Delete any lead       | ✅    | ❌ (own only) |
| View stats            | ✅ (global) | ✅ (own) |
| Export CSV            | ✅ (global) | ✅ (own) |
| Access /settings      | ✅    | ❌           |

---

## Design System

- **Dark background**: `#070B14`
- **Surface**: `#0B1020` / `#111827`
- **Border**: `#1E2A3D`
- **Accent**: `#7C3AED` (violet-600)
- **Text Primary**: `#F0F4FF`
- **Text Secondary**: `#8B99B5`
- **Font**: DM Sans (UI) + JetBrains Mono (code)

---

## License

MIT
