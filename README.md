# Smart Leads

A production-grade lead management system built on the MERN stack with TypeScript throughout. It covers the full lifecycle of a sales lead — capture, qualification, and closure — from a single, focused workspace. Role-based access gives admins a global view while sales users work within their own pipeline.

**Live demo:** [smart-leads-dashboard-ebon.vercel.app](https://smart-leads-dashboard-ebon.vercel.app)  
**Video walkthrough:** [Demo](https://drive.google.com/file/d/1KFluiSbHjSFZYrOV-2bpww5GdOyENE6W/view?usp=drive_link)

> Replace the two links above with your actual deployment URL and video URL before publishing.

---

## Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Docker (recommended)](#docker-recommended)
  - [Manual setup](#manual-setup)
- [Environment Variables](#environment-variables)
- [Role-Based Access Control](#role-based-access-control)
- [API Reference](#api-reference)
- [Design System](#design-system)
- [License](#license)

---

## Overview

Smart Leads is a two-tier web application. The backend is a REST API built with Express and Mongoose, persisting data to MongoDB. The frontend is a React single-page application that communicates exclusively through that API. In production the frontend is compiled and served by Nginx, which also reverse-proxies `/api` requests to the backend container, so the browser never crosses origins.

The application enforces a two-role model — `admin` and `sales` — at both the API middleware layer and in the React routing layer. A sales user can only read, edit, and delete their own leads. An admin has unrestricted access to all leads, global statistics, and the settings panel.

---

## Tech Stack

| Layer      | Technology                                                                              |
|------------|-----------------------------------------------------------------------------------------|
| Frontend   | React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Framer Motion, TanStack Query 5, Zustand 4, React Hook Form, Recharts |
| Backend    | Node.js 20, Express 4, TypeScript 5, Mongoose 8                                         |
| Database   | MongoDB 7                                                                               |
| Auth       | JWT (jsonwebtoken) with bcrypt password hashing (salt rounds: 12)                       |
| Infra      | Docker, Docker Compose, Nginx 1.25 (multi-stage builds)                                 |
| HTTP layer | Axios with request/response interceptors for token injection and 401 handling           |

---

## Features

**Authentication**

- Registration and login with JWT issuance on success
- Token stored in `localStorage` under `sl_token` and attached via Axios request interceptor
- 401 responses from any protected endpoint dispatch a global `auth:logout` event, clearing session state and redirecting to `/login`
- Public routes (`/login`, `/register`) redirect authenticated users away; protected routes redirect unauthenticated users to `/login`

**Lead management**

- Full CRUD: create, view, edit, and delete leads via modal forms and a slide-in detail drawer
- Each lead carries a name, email, status (`new` / `contacted` / `qualified` / `lost`), and source (`website` / `instagram` / `referral`)
- Status changes trigger in-app notifications persisted to `localStorage` (capped at 50 entries)

**Filtering and search**

- Filter by status and source simultaneously
- Debounced full-text search across name and email fields, backed by a MongoDB text index
- Sort by creation date ascending or descending
- All active filters pass through to the CSV export endpoint so the exported file matches what is on screen

**Pagination**

- Server-side pagination at 10 records per page with full metadata (`total`, `totalPages`, `hasNext`, `hasPrev`)
- TanStack Query `placeholderData` keeps the previous page visible while the next page loads, eliminating layout shifts

**Analytics**

- Time-series chart of lead volume over a configurable window (default 30 days) via Recharts
- Summary stat cards for total, new, contacted, qualified, and lost counts

**Theme**

- Dark and light modes toggled from the header; preference persisted via Zustand `persist` middleware
- Theme applied as a class on `<html>` (`dark` / `light`) so all CSS custom properties switch atomically

**UX details**

- Skeleton screens during initial data fetches
- Empty states with contextual copy when no leads match the active filters
- Optimistic query invalidation after every mutation so the UI reflects changes without a manual refresh

---

## Project Structure

```
smart-leads/
├── backend/
│   └── src/
│       ├── config/
│       │   └── db.ts                  MongoDB connection with retry logic
│       ├── controllers/
│       │   ├── auth.controller.ts     register, login, getMe
│       │   └── lead.controller.ts     getLeads, getLead, createLead, updateLead, deleteLead, getStats, getAnalytics, exportLeads
│       ├── middleware/
│       │   ├── auth.middleware.ts     authenticate (JWT verify), requireAdmin
│       │   └── error.middleware.ts    notFound, errorHandler, handleValidationErrors
│       ├── models/
│       │   ├── user.model.ts          User schema with pre-save bcrypt hook
│       │   └── lead.model.ts          Lead schema with text + compound indexes
│       ├── routes/
│       │   ├── auth.routes.ts         POST /register, POST /login, GET /me
│       │   └── lead.routes.ts         all /leads/* endpoints (all behind authenticate)
│       ├── services/
│       │   ├── auth.service.ts        user creation, credential verification, JWT signing
│       │   └── lead.service.ts        query building, pagination, analytics aggregation, CSV generation
│       ├── types/
│       │   └── index.ts               AuthRequest, JwtPayload, domain enums
│       ├── utils/
│       │   └── response.util.ts       sendSuccess, sendError helpers
│       ├── validators/
│       │   ├── auth.validator.ts      express-validator chains for register/login
│       │   └── lead.validator.ts      express-validator chains for create/update
│       ├── app.ts                     Express app, middleware wiring, route mounting
│       └── server.ts                  Entry point; connects DB then starts HTTP server
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   │   └── ProtectedRoute.tsx  PublicRoute and ProtectedRoute wrappers
│       │   ├── common/
│       │   │   ├── StatCard.tsx        Animated summary metric card
│       │   │   └── Pagination.tsx      Page controls with prev/next and page count
│       │   ├── layout/
│       │   │   ├── DashboardLayout.tsx Outlet wrapper with sidebar and header
│       │   │   ├── Sidebar.tsx         Navigation, logo, user info, sign-out
│       │   │   └── Header.tsx          Search, theme toggle, notification bell
│       │   ├── leads/
│       │   │   ├── LeadsTable.tsx      Responsive table with skeleton rows
│       │   │   ├── LeadsFilterBar.tsx  Status/source selects, search input, sort, export button
│       │   │   ├── LeadFormModal.tsx   Create/edit form in a Dialog
│       │   │   ├── LeadDetailDrawer.tsx Slide-in panel showing full lead record
│       │   │   └── DeleteLeadDialog.tsx Confirmation dialog for destructive action
│       │   └── ui/
│       │       ├── Button.tsx          Variants: default, ghost, destructive; sizes: sm, md, lg
│       │       ├── Input.tsx           Labelled input with optional right element and error display
│       │       ├── Select.tsx          Radix Select with custom trigger styling
│       │       ├── Badge.tsx           Status and source chips with colour-coded variants
│       │       ├── Dialog.tsx          Radix Dialog with overlay and close button
│       │       ├── Skeleton.tsx        Shimmer placeholder block
│       │       └── EmptyState.tsx      Icon + heading + body for zero-result states
│       ├── hooks/
│       │   ├── useAuth.ts             useLogin, useRegister, useLogout mutations
│       │   ├── useLeads.ts            useLeads, useLeadStats, useAnalytics, useCreateLead, useUpdateLead, useDeleteLead, useExportLeads
│       │   └── useDebounce.ts         Generic debounce hook (300 ms default)
│       ├── pages/
│       │   ├── auth/
│       │   │   └── AuthPage.tsx        Login/register toggle with animated transition
│       │   └── leads/
│       │       ├── DashboardPage.tsx   Stat cards + recent leads table
│       │       ├── LeadsPage.tsx       Full leads table with filter bar and pagination
│       │       └── AnalyticsPage.tsx   Time-series chart + per-source breakdown
│       ├── services/
│       │   ├── api.ts                  Axios instance with auth and 401 interceptors
│       │   ├── auth.service.ts         login(), register(), getMe()
│       │   └── lead.service.ts         getLeads(), getLead(), createLead(), updateLead(), deleteLead(), getStats(), exportCSV()
│       ├── store/
│       │   ├── auth.store.ts           Zustand auth slice (user, token, isAuthenticated)
│       │   ├── theme.store.ts          Zustand theme slice with DOM side-effect
│       │   └── notification.store.ts   In-app notification queue (persisted, capped at 50)
│       ├── types/
│       │   └── index.ts               LeadStatus, LeadSource, UserRole, Lead, User, form types, API shapes
│       ├── utils/
│       │   └── index.ts               cn(), formatDate(), formatRelative(), STATUS_META, SOURCE_META, extractErrorMessage()
│       ├── App.tsx                     QueryClient, BrowserRouter, route tree, Toaster
│       ├── main.tsx                    React DOM root mount
│       └── index.css                  CSS custom properties, scrollbar, skeleton animation, light-mode overrides
│
├── docker-compose.yml                 mongo + backend + frontend services with healthchecks
├── API_DOCS.md                        Full endpoint reference with request/response shapes
├── .env.example                       Root-level JWT_SECRET for docker-compose
└── README.md
```

---

## Getting Started

Node.js 20 and npm 9 or later are required for the manual path. Docker Desktop 4.x or later is required for the containerised path.

### Docker (recommended)

This path starts MongoDB, the API server, and the Nginx-served frontend as three containers on an isolated bridge network. No local MongoDB installation is needed.

```bash
# Clone the repository
git clone <repo-url> && cd smart-leads

# Create the root environment file
cp .env.example .env

# Open .env and set a strong value for JWT_SECRET
# It must be at least 32 characters; anything shorter will work but is not safe for production

# Build images and start all services
docker compose up --build
```

The application will be available at `http://localhost` once all three healthchecks pass. The backend healthcheck polls `GET /health` every 15 seconds; the frontend container does not start until the backend is healthy.

To stop and remove containers (data volume is preserved):

```bash
docker compose down
```

To also remove the MongoDB volume:

```bash
docker compose down -v
```

### Manual setup

Run the backend and frontend in separate terminals. MongoDB must be accessible — either a local `mongod` process or a connection string pointing to Atlas or another remote instance.

**Backend**

```bash
cd backend

npm install

cp .env.example .env
# Edit .env — at minimum set MONGO_URI and JWT_SECRET

npm run dev
# API available at http://localhost:5000
```

The dev server uses `ts-node-dev` with `--respawn --transpile-only`, so the process restarts automatically on file changes.

To build for production:

```bash
npm run build    # emits to dist/
npm start        # runs dist/server.js
```

**Frontend**

```bash
cd frontend

npm install

cp .env.example .env
# VITE_API_URL defaults to /api — this proxies through Vite's dev server to localhost:5000

npm run dev
# App available at http://localhost:5173
```

Vite proxies any request to `/api` to `http://localhost:5000` during development, so `VITE_API_URL=/api` works without CORS configuration in development. In the Docker setup the same path is handled by the Nginx `location /api/` block.

---

## Environment Variables

### Backend — `backend/.env`

| Variable          | Required | Default                   | Description                                                   |
|-------------------|----------|---------------------------|---------------------------------------------------------------|
| `NODE_ENV`        | No       | `development`             | Controls Morgan logging and error detail verbosity            |
| `PORT`            | No       | `5000`                    | TCP port the Express server binds to                          |
| `MONGO_URI`       | Yes      | —                         | Full MongoDB connection string                                |
| `JWT_SECRET`      | Yes      | —                         | Secret used to sign and verify JWTs; must be kept private     |
| `JWT_EXPIRES_IN`  | No       | `7d`                      | Token lifetime in any format accepted by the `jsonwebtoken` library (`7d`, `24h`, `3600`, etc.) |
| `CLIENT_URL`      | No       | `http://localhost:5173`   | Origin allowed by the CORS policy; set to your frontend domain in production |

`JWT_SECRET` has no default. The server will start without it in development but every authenticated request will fail. Set it before running in any environment.

### Frontend — `frontend/.env`

| Variable        | Default | Description                                                                   |
|-----------------|---------|-------------------------------------------------------------------------------|
| `VITE_API_URL`  | `/api`  | Base URL for all Axios requests. In production this resolves through Nginx. In development it is proxied by Vite. |

All Vite environment variables must be prefixed with `VITE_` to be included in the client bundle.

---

## Role-Based Access Control

Roles are assigned at registration and stored on the user document. The JWT payload includes the role, and the `authenticate` middleware attaches it to `req.user` on every protected request. Service-layer functions branch on `req.user.role` before executing queries, not after — a sales user's query is always scoped to `{ createdBy: req.user.id }`.

| Capability                         | Admin              | Sales              |
|------------------------------------|--------------------|--------------------|
| View leads                         | All leads          | Own leads only     |
| Create lead                        | Yes                | Yes                |
| Edit lead                          | Any lead           | Own leads only     |
| Delete lead                        | Any lead           | Own leads only     |
| View statistics                    | Global counts      | Own counts         |
| Export CSV                         | Global             | Own               |
| Analytics endpoint                 | Global             | Own               |
| Settings page                      | Yes                | No (redirected)    |

On the frontend, `ProtectedRoute` checks `isAuthenticated` from the auth store. Individual UI elements such as edit and delete buttons additionally check `user.role` or compare `lead.createdBy._id` against `user.id` before rendering.

---

## API Reference

The full endpoint reference with request bodies, response shapes, and error codes is in [API_DOCS.md](./API_DOCS.md).

A summary of available routes:

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                (authenticated)

GET    /api/leads                  (authenticated)  ?status &source &search &sort &page &limit
POST   /api/leads                  (authenticated)
GET    /api/leads/stats            (authenticated)
GET    /api/leads/analytics        (authenticated)  ?days
GET    /api/leads/export           (authenticated)  ?status &source &search &sort
GET    /api/leads/:id              (authenticated)
PUT    /api/leads/:id              (authenticated)
DELETE /api/leads/:id              (authenticated)

GET    /health                     (public)
```

All responses follow a consistent envelope:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "meta": {}
}
```

`meta` is present only on paginated list responses and contains `total`, `page`, `limit`, `totalPages`, `hasNext`, and `hasPrev`.

---

## Design System

The UI is dark by default. All colour values are defined as CSS custom properties on `:root` and overridden under `.light` for the light theme. Tailwind reads these through arbitrary value syntax where needed; the palette is also extended in `tailwind.config.ts` for use in utility classes.

| Token              | Dark value  | Light value |
|--------------------|-------------|-------------|
| `--bg`             | `#070B14`   | `#F8FAFC`   |
| `--surface-1`      | `#0B1020`   | `#FFFFFF`   |
| `--surface-2`      | `#111827`   | `#F1F5F9`   |
| `--surface-3`      | `#1A2236`   | `#E2E8F0`   |
| `--border`         | `#1E2A3D`   | `#E2E8F0`   |
| `--border-light`   | `#2A3A54`   | `#CBD5E1`   |
| `--accent`         | `#7C3AED`   | `#7C3AED`   |
| `--text-primary`   | `#F0F4FF`   | `#0F172A`   |
| `--text-secondary` | `#8B99B5`   | `#475569`   |
| `--text-muted`     | `#4D5F7A`   | `#94A3B8`   |

**Typography**

- UI text: DM Sans (variable weight, loaded from Google Fonts)
- Monospace: JetBrains Mono (used for identifiers and code fragments)

**Status colours**

| Status      | Colour      |
|-------------|-------------|
| `new`       | Blue 400    |
| `contacted` | Amber 400   |
| `qualified` | Emerald 400 |
| `lost`      | Red 400     |

**Motion**

Page-level elements animate in with a `fadeUp` keyframe (12 px vertical translate, 400 ms ease-out). Skeleton placeholders cycle a horizontal shimmer at 1.8 s. All interactive state transitions (hover, focus, active) use 120 ms ease, keeping the interface responsive without feeling jittery.

---

## License

MIT
