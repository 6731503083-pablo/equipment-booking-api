# Campus Equipment Booking API

Midterm practical lab test. A REST API for booking shared faculty equipment (projectors, cameras, meeting rooms) that refuses overlapping bookings for the same item.

| | |
|---|---|
| **Stack** | Cloudflare Workers · Hono · TypeScript · D1 (SQLite) |
| **Live API (Cloudflare)** | <https://equipment-booking-api.phyo2lay.workers.dev/api> |
| **Local API** | `http://localhost:8787/api` |
| **Test results** | 49 / 49 passed, both [locally](TEST_EVIDENCE.md) and [on the live API](docs/live-test-results.md) |

## Run it

Requires Node.js 20+.

```bash
npm install
npm run db:reset      # create the local D1 database: tables + 3 equipment rows
npm run dev           # API on http://localhost:8787/api
```

In a second terminal:

```bash
npm run test:curl     # runs 49 curl cases, writes TEST_EVIDENCE.md
npm run typecheck     # TypeScript check
```

Quick manual check:

```bash
curl -s http://localhost:8787/api/equipment

curl -s -X POST http://localhost:8787/api/bookings \
  -H 'Content-Type: application/json' \
  -d '{
    "equipmentId": "eq-1",
    "borrowerName": "Somchai Jaidee",
    "startAt": "2026-10-20T09:00:00.000Z",
    "endAt": "2026-10-20T11:00:00.000Z",
    "purpose": "Class presentation"
  }'
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

| Requirement | Where | Notes |
|---|---|---|
| Source code | [src/](src/) · [migrations/](migrations/) | Routes, validation, schema and seed data |
| Run instructions | [Run it](#run-it) (above) | |
| API contract | [API_CONTRACT.md](API_CONTRACT.md) | Endpoints, rules, status-code reasoning, assumptions |
| Schema / ERD | [SCHEMA.md](SCHEMA.md) | ER diagram, data dictionary, constraints, indexes |
| AI log | [AI_LOG.md](AI_LOG.md) | |
| Quality Gate review | [QUALITY_GATE_REVIEW.md](QUALITY_GATE_REVIEW.md) | 6 findings, final checklist, decision |
| Test evidence + Base API URL | [TEST_EVIDENCE.md](TEST_EVIDENCE.md) | 49 cases, including all 9 steps of [curl_test_guide.md](curl_test_guide.md) |
| Live API test run | [docs/live-test-results.md](docs/live-test-results.md) | Same 49 cases against the Cloudflare deployment |
| Pre-review snapshot | Tag [`v1-snapshot`](https://github.com/6731503083-pablo/equipment-booking-api/tree/v1-snapshot) | Its test run: [docs/v1-test-results.md](docs/v1-test-results.md) |

## Project layout

```
src/index.ts              routes, SQL, error handling
src/validation.ts         request-body validation and UTC time normalisation
migrations/0001_init.sql  tables, index, seed equipment
tests/curl-tests.sh       curl test suite → TEST_EVIDENCE.md
docs/                     v1 probes and v1 test run (Quality Gate "before" evidence)
```

## Test summary

The latest run is **49 passed, 0 failed** against `http://localhost:8787/api`. It covers:
- all 9 steps of the instructor's [curl_test_guide.md](curl_test_guide.md), unchanged;
- create, read, update and delete;
- validation errors (400);
- not found (404);
- overlap conflicts (409) on both create and update;
- timezone handling;
- SQL injection attempts;
- parallel overlapping requests.

See [TEST_EVIDENCE.md](TEST_EVIDENCE.md).
