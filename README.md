# Campus Equipment Booking API

Midterm practical lab test. A REST API for booking shared faculty equipment (projectors, cameras, meeting rooms) that refuses overlapping bookings for the same item.

**Stack:** Cloudflare Workers · Hono · TypeScript · D1 (SQLite)
**Base API URL used for testing:** `http://localhost:8787/api`

## Run it

Requires Node.js 20+.

```bash
npm install
npm run db:reset      # create the local D1 database: tables + 3 equipment rows
npm run dev           # API on http://localhost:8787/api
```

In a second terminal:

```bash
npm run test:curl     # runs 40 curl cases, writes TEST_EVIDENCE.md
npm run typecheck     # TypeScript check
```

Quick manual check:

```bash
curl -s http://localhost:8787/api/equipment

curl -s -X POST http://localhost:8787/api/bookings \
  -H 'Content-Type: application/json' \
  -d '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}'
```

## Endpoints

| Method | Path | Success | Errors |
|---|---|---:|---|
| `GET` | `/api/equipment` | 200 | |
| `GET` | `/api/bookings` | 200 | |
| `GET` | `/api/bookings/:id` | 200 | 404 |
| `POST` | `/api/bookings` | 201 | 400, 409 |
| `PATCH` | `/api/bookings/:id` | 200 | 400, 404, 409 |
| `DELETE` | `/api/bookings/:id` | 204 | 404 |

All errors are returned as `{ "error": "..." }`. The full contract, business rules, status-code reasoning and assumptions are in **[API_CONTRACT.md](API_CONTRACT.md)**.

## Submission contents

| Requirement | File |
|---|---|
| Runnable source + run instructions | [src/](src/), [migrations/](migrations/), this README |
| API contract | [API_CONTRACT.md](API_CONTRACT.md) |
| Schema / ERD | [SCHEMA.md](SCHEMA.md) |
| AI log | [AI_LOG.md](AI_LOG.md) |
| Quality Gate review | [QUALITY_GATE_REVIEW.md](QUALITY_GATE_REVIEW.md) |
| Test evidence (40 cases) + Base API URL | [TEST_EVIDENCE.md](TEST_EVIDENCE.md) |
| Pre-review snapshot | git tag `v1-snapshot`; its test run is in [docs/v1-test-results.md](docs/v1-test-results.md) |

## Project layout

```
src/index.ts              routes, SQL, error handling
src/validation.ts         request-body validation and UTC time normalisation
migrations/0001_init.sql  tables, index, seed equipment
tests/curl-tests.sh       curl test suite → TEST_EVIDENCE.md
docs/                     v1 probes and v1 test run (Quality Gate "before" evidence)
```

## Test summary

The latest run is **40 passed, 0 failed** against `http://localhost:8787/api`. It covers:
- create, read, update and delete;
- validation errors (400);
- not found (404);
- overlap conflicts (409) on both create and update;
- timezone handling;
- SQL injection attempts;
- parallel overlapping requests.

See [TEST_EVIDENCE.md](TEST_EVIDENCE.md).
