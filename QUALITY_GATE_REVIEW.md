# Quality Gate Review

- **Before:** commit `1dd3879`, tagged `v1-snapshot`. This is the first working version, committed before the review (the brief's minute-30 snapshot). View it with `git show v1-snapshot:src/index.ts`.
- **After:** the current code. `src/validation.ts` was added and `src/index.ts` was rewritten.
- **Checklist:** `quality_gate.md` is referenced in the brief but wasn't in the provided folder. The review is organised by the categories the brief names (Reliability/Accuracy, Reasoning/You Own It) plus Security and Error handling. If the instructor's checklist uses different headings, each finding below maps directly onto them.

## How the review was done

1. Probed v1 with curl edge cases instead of only the happy path. The raw output is in [docs/v1-review-probes.txt](docs/v1-review-probes.txt).
2. Fixed each problem found.
3. Wrote [tests/curl-tests.sh](tests/curl-tests.sh) (40 cases) and ran the **same suite against both versions**:

| Version | Result | Evidence |
|---|---|---|
| v1 snapshot | **32 passed, 8 failed** | [docs/v1-test-results.md](docs/v1-test-results.md) |
| Final | **40 passed, 0 failed** | [TEST_EVIDENCE.md](TEST_EVIDENCE.md) |

Running the suite against v1 also checks the tests themselves: a test that can't fail on the old code proves nothing.

## Findings

Format: **what was found → how it was fixed → evidence.**

### 1. Overlap check missed real conflicts when times used a timezone offset — *Reliability / Accuracy*

**Found.** v1 stored `startAt` and `endAt` exactly as sent and compared them as text in SQL. `"2026-10-20T15:00:00+07:00"` is 08:00 UTC, so it overlaps an existing 09:00–11:00Z booking. As text, however, it sorts after `"2026-10-20T11:00…Z"`, so v1 accepted the double booking with **201**. The core business rule broke silently for anyone sending Thai local time.

**Fixed.** Every time is now converted with `new Date(raw).toISOString()` before it is compared or stored (`parseDateTime` in [src/validation.ts](src/validation.ts)). All stored times share one format, `YYYY-MM-DDTHH:mm:ss.sssZ`, so text order equals time order.

**Evidence.**
- v1: probe returned `201` ([docs/v1-review-probes.txt](docs/v1-review-probes.txt)). Test 23 FAILS in [docs/v1-test-results.md](docs/v1-test-results.md).
- Final: test 23 → `409`. Test 5 shows `09:00+07:00` stored as `02:00:00.000Z`.

### 2. Date parsing accepted impossible and ambiguous dates — *Reliability / Accuracy*

**Found.** v1 validated dates with `isNaN(Date.parse(x))`. Testing it in Node showed:
- `2026-02-30T09:00:00Z` is accepted and silently becomes **March 2**.
- `2026-10-20T09:00` (no timezone) is read in the **server's local timezone**, so the same request means different instants on different machines.
- `"20 Oct 2026"` is accepted too.

**Fixed.** A strict ISO 8601 pattern now requires a time and a timezone (`Z` or `±hh:mm`). An explicit calendar check rejects days that don't exist, and impossible offsets such as `+99:00` are rejected.

**Evidence.**
- v1: tests 16 and 17 FAIL (`201` and `409` where `400` was expected).
- Final: tests 16 and 17 → `400` with a message naming the expected format.

### 3. Check-then-insert race could create a double booking — *Reliability / Accuracy*

**Found.** v1 ran `SELECT` (is there an overlap?) and then a separate `INSERT`. Two requests for the same slot arriving together can both run the SELECT before either INSERT, so both see "free" and both insert. D1 has no interactive transactions to wrap the two statements. The same gap existed in PATCH.

**Fixed.** The overlap condition now sits **inside** the write as a single statement: `INSERT INTO bookings … SELECT … WHERE NOT EXISTS (overlapping booking) RETURNING *`. The same pattern is used for `UPDATE … WHERE id = ? AND NOT EXISTS (…)`. SQLite runs one statement atomically. If no row comes back, the slot was taken and the API returns `409`. For PATCH it first re-checks whether the booking was deleted in the meantime, and returns `404` in that case.

**Evidence.**
- Test 40 fires 5 identical overlapping POSTs in parallel → exactly one `201` and four `409`.
- Honest limitation: local `wrangler dev` may process requests one at a time, so this test confirms correct behaviour but can't reproduce the race. The guarantee comes from the single statement, not the test.

### 4. Errors weren't JSON, and malformed input crashed with 500 — *Error handling*

**Found.** A malformed JSON body returned `500 Internal Server Error` as **plain text**, and an unknown route returned plain-text `404 Not Found`. Both break the brief's rule that every error is `{ "error": "..." }`, and a client error was reported as a server fault.

**Fixed.**
- `readJson()` catches parse failures and returns `400`.
- `app.onError` turns any uncaught exception into a JSON `500`.
- `app.notFound` returns a JSON `404`.

**Evidence.**
- v1: test 13 FAILS (`500`). The probe shows the plain-text bodies.
- Final: test 13 → `400 {"error":"Request body must be valid JSON"}`. Test 39 → `404 {"error":"Route not found: GET /api/nope"}`.
- v1 passed test 39 only because the status code was right. The body wasn't JSON, which the probe file shows. This revealed that the suite checks status codes, not body shape, so the body was inspected by hand as well.

### 5. Wrong types, blank values, typos and empty updates were accepted — *Reliability / Accuracy*

**Found.**
- `borrowerName: 123` and `purpose: true` were stored as the strings `"123.0"` and `"1.0"` (D1 coerced them).
- A blank `"   "` name passed the `!value` check.
- A typo such as `startTime` was silently ignored.
- `PATCH {}` returned `200` while changing nothing.

**Fixed.** `validateCreate` and `validateUpdate` in [src/validation.ts](src/validation.ts):
- check every field is a string, trim it, and reject blanks;
- enforce maximum lengths;
- reject unknown fields and non-object bodies;
- require at least one field on PATCH.

**Evidence.**
- v1: tests 14, 15, 18 and 29 FAIL.
- Final: tests 14, 15, 18, 19 and 29 → `400`, each with a message saying which field is wrong.

### 6. Decisions behind the code weren't written down or tested — *Reasoning / You Own It*

**Found.** v1 behaved in ways that were never stated or tested:
- Unknown `equipmentId` returns 400 (why not 404?).
- Back-to-back bookings are allowed (is 11:00 the end of one booking or the start of the next?).
- A PATCH excludes the booking itself from the overlap check.
- PATCH checks 404 before 400.

These choices would be hard to defend in the ownership questions if they existed only in the code.

**Fixed.**
- Wrote the reasoning into [API_CONTRACT.md](API_CONTRACT.md) ("Why these status codes", "Business rules", "Assumptions") and [SCHEMA.md](SCHEMA.md) ("Design choices").
- Added comments in the code at each decision point (the half-open interval rule, why the overlap check is inside the write, why times are normalised).
- Added tests that pin each decision, so a later change can't quietly reverse one.

**Evidence.**
- Test 3: back-to-back 11:00–12:00 → `201`.
- Test 25: shifting a booking over its own old slot → `200`.
- Test 12: unknown `equipmentId` → `400`.
- Test 35: after a delete, the same slot books → `201`, which demonstrates that 409 depends on current state, unlike 400.

## Additional verification (not a defect)

- **SQL injection:** every query uses `.prepare(...).bind(...)`. No request data is concatenated into SQL, and this was checked by reading every `prepare` call. The one `${…}` inside SQL is `${NO_OVERLAP}`, a constant SQL fragment written in the source whose values are `?` placeholders. It never contains request data. Test 36 sends `x' OR '1'='1` in the URL → `404`. Test 37 stores `Robert'); DROP TABLE bookings;--` as a plain name. Test 38 confirms the table is intact.
- **Database constraints:** an insert run directly against local D1 with `eq-999` failed with `FOREIGN KEY constraint failed`, and one with `start_at > end_at` failed with `CHECK constraint failed: start_at < end_at`. Both rules hold even if the API were bypassed.
