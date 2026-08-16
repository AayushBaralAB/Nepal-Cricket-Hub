# CricketHub

A modern, professional cricket platform focused on Nepal cricket — live scores, fixtures, results,
automatic news aggregation, player statistics, NPL coverage, and points tables.

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Node.js + Express (REST API) with scheduled jobs
- **Database:** MongoDB (official `mongodb` driver)
- **Auth:** Admin bearer token (server-side env `ADMIN_API_TOKEN`)
- **Scheduling:** node-cron

## Repository layout

```
├── backend/            # Express REST API + cron schedulers + service layer
├── frontend/           # Next.js website + admin dashboard
└── README.md
```

## Quick start

### 1. Database

Start a MongoDB instance (local `mongod` or MongoDB Atlas) and note the connection string.
No schema migrations are required — collections and indexes are created automatically on first boot.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URL, ADMIN_API_TOKEN, etc.
npm run seed           # optional: demo teams/series/players/matches/news/videos/ads
npm run dev
```

Start the scheduler separately (long-running):

```bash
npm run jobs
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Architecture

### Service layer

All external data flows through a provider-agnostic service layer in
`backend/src/services`. The frontend never talks to third-party cricket APIs
directly — it only calls our REST API. This means the upstream cricket API
(or news sources) can be swapped without touching the frontend.

- `CricketService` – live matches, scorecards, fixtures, results
- `NewsService` – RSS/API aggregation, Nepal filtering, dedupe, categorisation
- `MatchService` – match persistence + score sync
- `PlayerService` – player profiles + statistics
- `TeamService` – teams + rosters
- `SeriesService` – series/tournaments + points tables

Providers live in `backend/src/services/providers`:

- `SampleCricketProvider` – realistic offline data (default during development)
- `HttpCricketProvider` – a generic REST cricket API adapter (drop-in for
  CricAPI / Cricbuzz-syle / custom endpoints). Configure via env.

### Automatic updates

`backend/src/jobs`:

| Job | Interval | Purpose |
| --- | --- | --- |
| `cricketSync` | every 2 min | Fetch live scores, update scorecards, fixtures, results, points tables |
| `newsSync` | every 10 min | Poll RSS/news sources, filter Nepal cricket, dedupe, store summaries |
| `cleanup` | hourly | Prune stale data, trim api_logs |

### Failure protection

- Last successful data is retained in MongoDB and served if the upstream API fails.
- Errors are logged to `api_logs` and surfaced in the admin dashboard.
- Retries happen automatically on the next scheduled run.
- The frontend shows "Live data temporarily unavailable. Showing the latest available information." when appropriate.

## Environment variables

Backend: see `backend/.env.example`.
Frontend: see `frontend/.env.example`.

## Key security notes

- API keys live only in the backend (server-side) environment — never in frontend code.
- The frontend uses our REST API only; the admin panel authenticates with `ADMIN_API_TOKEN`.
- News content stores headlines + permitted summaries/excerpts and links to the
  original source. Full copyrighted articles are never copied.

## Production notes

- Run the scheduler on a single instance (e.g. a small VPS or a cron-capable
  platform like Railway / Render / GitHub Actions cron).
- Point `NEXT_PUBLIC_API_BASE_URL` at the deployed backend.
- Set a strong, unique `ADMIN_API_TOKEN` server-side only.
