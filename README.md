# API Mock Simulator

API Mock Simulator is a full-stack workspace for creating mock HTTP endpoints, simulating latency and failure rates, and calling those endpoints with real requests.

## Project Structure

- `frontend/` - React + Vite + Tailwind CSS UI
- `backend/` - Node.js + Express + PostgreSQL API

## Features

- Create, edit, delete, duplicate, and disable mock APIs
- Dynamic mock routing with no hardcoded endpoint handlers
- Simulated delay, random failures, and custom status codes
- API tester for real HTTP calls against generated mocks
- Search and filter in the dashboard
- Copyable full mock URLs

## Environment Setup

Create these files from the provided examples:

- `backend/.env`
- `frontend/.env`

Example backend variables for local PostgreSQL:

- `PORT=5000`
- `DB_USER=postgres`
- `DB_HOST=localhost`
- `DB_NAME=api_mock_simulator`
- `DB_PASSWORD=`
- `DB_PORT=5432`

Example backend variables for Render or Supabase:

- `DATABASE_URL=postgresql://...`

Example frontend variable:

- `VITE_API_BASE_URL=http://localhost:5000`

## Deployment Guide

### Frontend on Vercel

- Root directory: `frontend`
- Framework preset: `Vite` / `React`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
	- `VITE_API_BASE_URL=https://your-render-backend.onrender.com`

### Backend on Render

- Root directory: `backend`
- Runtime: `Node`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
	- `DATABASE_URL=your-hosted-postgres-connection-string`
	- `PORT` is provided by Render automatically

### Database choice

- You do **not** need Supabase specifically.
- `pgAdmin` is only a client to manage PostgreSQL. It is not the database host.
- For deployment, use any hosted PostgreSQL provider and paste its connection string into `DATABASE_URL`.
- Good options are Render PostgreSQL, Supabase PostgreSQL, or another hosted Postgres provider.

The backend now supports `DATABASE_URL`, so you do not need to change your code again if you choose a hosted database.

## Database

The backend creates the `mock_apis` table automatically on startup if PostgreSQL is reachable.

Required columns:

- `id` UUID primary key
- `endpoint` text
- `method` text
- `response` jsonb
- `status_code` integer
- `delay` integer
- `error_rate` integer
- `is_active` boolean
- `created_at` timestamp

## Development

From the repository root:

```bash
npm install
npm run dev
```

This starts both workspaces:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## API Endpoints

Management APIs:

- `POST /api/mock`
- `GET /api/mock`
- `GET /api/mock/:id`
- `PUT /api/mock/:id`
- `DELETE /api/mock/:id`
- `POST /api/mock/:id/duplicate`
- `PATCH /api/mock/:id/toggle`

Dynamic mock requests use:

- `app.use('/mock', dynamicHandler)`

Example:

- create `GET /users`
- call `GET /mock/users`

The backend applies the configured delay, error rate, and stored response.

## Notes

- The workspace uses PostgreSQL directly through `pg` with parameterized queries.
- The frontend uses Axios for management calls and `fetch` for live mock testing.
- Tailwind CSS is configured in the `frontend/` workspace.
