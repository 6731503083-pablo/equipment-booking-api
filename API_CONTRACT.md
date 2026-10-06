# API Contract — Campus Equipment Booking API

**Base URL (local):** `http://localhost:8787/api`. Every path below is relative to it.
All request and response bodies are JSON (`Content-Type: application/json`).

## Endpoints

| Method | Path | Success | Errors | Purpose |
|---|---|---:|---|---|
| `GET` | `/equipment` | 200 | — | List all equipment |
| `GET` | `/bookings` | 200 | — | List all bookings, ordered by `startAt` |
| `GET` | `/bookings/:id` | 200 | 404 | Get one booking |
| `POST` | `/bookings` | 201 | 400, 409 | Create a booking |
| `PATCH` | `/bookings/:id` | 200 | 400, 404, 409 | Update some or all fields of a booking |
| `DELETE` | `/bookings/:id` | 204 (no body) | 404 | Delete a booking |
| any | any other path | — | 404 | Unknown route |

## Resources

### Equipment

```json
{ "id": "eq-1", "name": "Projector A", "location": "Building 1" }
```

The seed data contains `eq-1` (Projector A), `eq-2` (Camera Canon EOS R6) and `eq-3` (Meeting Room M-301).
Equipment is read-only through the API.

### Booking (response)

```json
{
  "id": "a89cf196-036b-4a93-b67d-1fa77a009cf2",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation",
  "createdAt": "2026-10-06T06:31:38.761Z",
  "updatedAt": "2026-10-06T06:31:38.761Z"
}
```

`id` is a server-generated UUID. `createdAt` and `updatedAt` are extra fields the server sets.

### Booking (request body)

| Field | Type | POST | PATCH | Rules |
|---|---|---|---|---|
| `equipmentId` | string | required | optional | Must be the id of existing equipment |
| `borrowerName` | string | required | optional | Trimmed; 1–100 characters |
| `startAt` | string | required | optional | ISO 8601 date-time **with a timezone** (`Z` or `±hh:mm`); must be a real calendar date |
| `endAt` | string | required | optional | Same as `startAt`; must be later than `startAt` |
| `purpose` | string | required | optional | Trimmed; 1–500 characters |

- Any other field gets a `400`. This catches typos such as `startTime` that would otherwise be silently ignored.
- On PATCH the body must contain at least one field. The fields sent are validated the same way as on POST and then merged over the stored booking. The time-order and overlap rules are checked on the **merged** result.

## Business rules

1. **`equipmentId` must exist.** Checked on POST, and on PATCH when `equipmentId` changes.
2. **`startAt` < `endAt`.** Equal times are rejected because a zero-length booking is meaningless.
3. **No overlapping bookings for the same equipment.** A booking covers the half-open interval `[startAt, endAt)`. Two bookings overlap when `existing.startAt < new.endAt AND new.startAt < existing.endAt`.
   - Back-to-back bookings are allowed: 09:00–11:00 and 11:00–12:00 do not overlap.
   - The same time on **different** equipment is allowed.
   - On PATCH the booking being updated is excluded, so it never conflicts with itself.
4. **Times are stored and returned in UTC.** `2026-10-20T15:00:00+07:00` is stored as `2026-10-20T08:00:00.000Z`, so a booking sent in Thai time is compared correctly with one sent in UTC.

## Errors

Every error response has this shape:

```json
{ "error": "A message understandable to a user or developer" }
```

| Status | When | Example message |
|---:|---|---|
| `400 Bad Request` | The request body is wrong: invalid JSON, not an object, missing or unknown field, wrong type, blank value, bad date, `startAt` ≥ `endAt`, unknown `equipmentId`, empty PATCH | `startAt must be before endAt` |
| `404 Not Found` | The resource named **in the URL** doesn't exist (booking id, or an unknown route) | `Booking not found: does-not-exist` |
| `409 Conflict` | The request is valid but clashes with the current state: the time overlaps another booking for the same equipment | `Equipment eq-1 is already booked for an overlapping time` |
| `500 Internal Server Error` | Unexpected server failure (still JSON) | `Internal server error` |

### Why these status codes

- **400 vs 409.** 400 means *the request itself is wrong* and would be wrong whenever it was sent. 409 means *the request is valid, but it conflicts with data that exists right now*. If the other booking is deleted, the same request succeeds (test 35 shows this). The client fixes a 400 by correcting the request and a 409 by choosing another time.
- **Unknown `equipmentId` → 400, not 404.** The URL (`/bookings`) exists. What's wrong is a value inside the body, so this is invalid input. A 404 would wrongly suggest the endpoint itself is missing.
- **PATCH order: 404 before 400.** If the booking id doesn't exist, there is nothing to validate the body against, so the 404 is returned first.
- **DELETE → 204, no body.** Nothing is left to return. Deleting the same id again returns 404, because it no longer exists.

## Assumptions

1. Equipment is fixed seed data. Creating, editing or deleting equipment isn't required, so it isn't exposed.
2. No authentication. Anyone can create, edit or delete any booking (outside the brief's scope).
3. `purpose` is required, since the brief's payload always includes it.
4. Bookings may be made for any time, including the past. The brief doesn't forbid it, and rejecting past times would make tests depend on the current date.
5. No maximum booking length and no opening hours. Neither is in the brief.
6. Times without a timezone are rejected rather than guessed (see `QUALITY_GATE_REVIEW.md`, finding 2).
