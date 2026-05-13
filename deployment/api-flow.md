# API Flow

The app uses a single snapshot API so the client can stay simple.

## Endpoints

- `GET /api/timer` - load the current snapshot
- `PUT /api/timer` - persist a full snapshot after changes
- `DELETE /api/timer` - reset the snapshot to an empty state
- `GET /api/health` - readiness check for deployment

## Data flow

1. The timer app loads and calls `GET /api/timer`.
2. The response hydrates `TimerProvider` and the localStorage cache.
3. User actions update local state in the browser.
4. The timer context writes the updated snapshot back through `PUT /api/timer`.
5. History and analytics pages read the same snapshot and render from it.

## Storage behavior

- In Azure, the snapshot store prefers Azure SQL.
- During development, the store falls back to `.data/timer-store.json`.
- The API contract remains the same either way.
# focusBreaker API Flow

This document describes the current backend contract for the timer app.

## Data flow overview

1. The client loads the timer app and reads `localStorage` as the first-pass offline cache.
2. The timer context calls `GET /api/timer` to hydrate from the server snapshot when available.
3. Any local write operation updates `localStorage` first so the UI stays responsive.
4. The storage manager then best-effort syncs the snapshot back to the backend.
5. The backend persists the snapshot in Azure SQL when a connection string is present.
6. If Azure SQL is unavailable during development, the server falls back to the file snapshot store.

## Current endpoints

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Readiness check for deployment and demo verification |
| GET | `/api/timer` | Read the current timer snapshot |
| PUT | `/api/timer` | Replace the current timer snapshot |
| DELETE | `/api/timer` | Clear the current timer snapshot |

## Azure SQL behavior

The SQL-backed store uses a single logical profile with `profileId = 'default'` and stores:

- `dbo.TimerProfiles` for the demo profile
- `dbo.TimerSettings` for one row of app preferences
- `dbo.TimerSessions` for each recorded timer session
- `dbo.TimerDailyStats` for daily aggregates and compliance metrics

This lets the app keep its current API shape while still using a real relational database behind the scenes.