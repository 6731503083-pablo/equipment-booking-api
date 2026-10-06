# Quality Gate Review

Review against the instructor's [quality_gate.md](quality_gate.md), used at the two points it asks for:

1. **After the first version.** Commit `a8b9b27`, tagged `v1-snapshot` (view it with `git show v1-snapshot:src/index.ts`). This review produced the six findings below.
2. **Final check before submission.** The full checklist, ticked with evidence, is at the end of this file.

## Quality Gate Review Record

| Quality Gate area | Finding | Action taken | Evidence |
|---|---|---|---|
| **Accuracy** | The overlap check missed real conflicts when a time used an offset: `15:00+07:00` (= 08:00Z) was accepted over an existing 09:00–11:00Z booking. | Every time is converted to UTC with `toISOString()` before it is compared or stored. | v1 → `201` (test 32 fails). Final → `409` (test 32). |
| **Accuracy** | Impossible and ambiguous dates were accepted: `2026-02-30` became March 2, and a time with no timezone was read in server-local time. | Strict ISO 8601 format with a required timezone, plus a calendar check. | v1: tests 25 and 26 fail. Final → `400`. |
| **Reliability** | Check-then-insert race: two simultaneous requests could both pass the overlap `SELECT` and both `INSERT`. This applied to create **and** update. | The overlap check moved inside the write: a single `INSERT/UPDATE … WHERE NOT EXISTS (…)` statement. | Test 49: 5 parallel identical requests → one `201`, four `409`. |
| **Reliability** | Invalid requests crashed: malformed JSON → plain-text `500`. Unknown route → plain-text `404`. | JSON parse errors → `400`. `onError` and `notFound` return `{ "error": … }`. | v1: test 22 fails (`500`). Final: tests 22 and 48 return JSON. |
| **Accuracy** | Wrong types were coerced (`123` stored as `"123.0"`), blank names and typo fields were accepted, and `PATCH {}` returned `200`. | Typed, trimmed validation. Unknown fields are rejected. PATCH needs at least one field. | v1: tests 23, 24, 27 and 38 fail. Final → `400`. |
| **Reasoning / You Own It** | Key design decisions were in the code but never written down or tested: 400 vs 404 for an unknown `equipmentId`, back-to-back bookings, a PATCH excluding itself from the overlap check. | Wrote the reasoning into the API contract and schema docs, and added tests that pin each decision. | Tests 12, 21, 34 and 44. "Why these status codes" in [API_CONTRACT.md](API_CONTRACT.md). |

## How the review was done

1. Probed v1 with curl edge cases that go beyond the instructor's guide ([docs/v1-review-probes.txt](docs/v1-review-probes.txt)).
2. Fixed each problem and wrote [tests/curl-tests.sh](tests/curl-tests.sh). It contains the 9 steps of [curl_test_guide.md](curl_test_guide.md) unchanged, plus 40 more cases.
3. Ran the **same 49-case suite against both versions**:

| Version | Instructor guide (steps 1–9) | Full suite | Evidence |
|---|---|---|---|
| v1 snapshot | 9 / 9 | **41 passed, 8 failed** | [docs/v1-test-results.md](docs/v1-test-results.md) |
| Final | 9 / 9 | **49 passed, 0 failed** | [TEST_EVIDENCE.md](TEST_EVIDENCE.md) |

**Takeaway:** v1 already passed every step of the instructor's guide, yet it still let equipment be double-booked. Only the extra edge-case tests exposed the bugs. Running the suite against v1 also checks the tests themselves: each fix has a test that fails on the old code.

## Findings in detail

Format: **finding → action taken → evidence.**

### 1. Overlap check missed conflicts when times used an offset — *Accuracy*

**Finding.** v1 stored `startAt` and `endAt` exactly as sent and compared them as text in SQL. `"2026-10-20T15:00:00+07:00"` is 08:00 UTC and overlaps an existing 09:00–11:00Z booking. As text, though, it sorts after `"2026-10-20T11:00…Z"`, so v1 accepted the double booking with **201**. The core business rule broke silently for anyone sending Thai local time.

**Action taken.** Every time is converted with `new Date(raw).toISOString()` before it is compared or stored (`parseDateTime` in [src/validation.ts](src/validation.ts)). All stored times share the format `YYYY-MM-DDTHH:mm:ss.sssZ`, so text order equals time order.

**Evidence.**
- v1: the probe returned `201`. Test 32 FAILS in [docs/v1-test-results.md](docs/v1-test-results.md).
- Final: test 32 → `409`. Test 14 shows `09:00+07:00` stored as `02:00:00.000Z`.

### 2. Date parsing accepted impossible and ambiguous dates — *Accuracy*

**Finding.** v1 used `isNaN(Date.parse(x))`. Testing it in Node showed three problems:
- `2026-02-30T09:00:00Z` is accepted and becomes **March 2**.
- `2026-10-20T09:00` (no timezone) is read in the **server's local timezone**, so the same request means different instants on different machines.
- `"20 Oct 2026"` is accepted.

**Action taken.** A strict ISO 8601 pattern now requires a time and a timezone (`Z` or `±hh:mm`). An explicit calendar check rejects dates that don't exist, and impossible offsets such as `+99:00` are rejected.

**Evidence.**
- v1: tests 25 and 26 FAIL.
- Final: tests 25 and 26 → `400`, with a message naming the expected format.

### 3. Check-then-insert race could create a double booking — *Reliability*

**Finding.** v1 ran a `SELECT` (any overlap?) and then a separate `INSERT`. Two requests for the same slot arriving together can both run the SELECT before either INSERT, so both see "free" and both insert. D1 has no interactive transactions to wrap the two statements, and PATCH had the same gap. The gate asks that *"creating or updating a booking cannot create an overlap"*, and v1 only met that for requests arriving one at a time.

**Action taken.** The overlap condition now sits **inside** the write as a single statement: `INSERT INTO bookings … SELECT … WHERE NOT EXISTS (overlapping booking) RETURNING *`, and the same pattern for `UPDATE … WHERE id = ? AND NOT EXISTS (…)`. SQLite runs one statement atomically. If no row comes back, the slot was taken and the API returns `409`. For PATCH it first re-checks whether the booking was deleted in the meantime, and returns `404` in that case.

**Evidence.**
- Test 49 fires 5 identical overlapping POSTs in parallel → exactly one `201` and four `409`.
- Limitation: local `wrangler dev` may process requests one at a time, so this test confirms the result but can't reproduce the race. The guarantee comes from the single statement.

### 4. Invalid requests crashed, and errors weren't JSON — *Reliability*

**Finding.** A malformed JSON body returned `500 Internal Server Error` as **plain text**, and an unknown route returned plain-text `404 Not Found`. This fails two gate checks: *"handles invalid requests without crashing"* and *"every error response uses JSON"*.

**Action taken.**
- `readJson()` catches parse failures and returns `400`.
- `app.onError` turns any uncaught exception into a JSON `500`.
- `app.notFound` returns a JSON `404`.

**Evidence.**
- v1: test 22 FAILS (`500`). The probe shows the plain-text bodies.
- Final: test 22 → `400 {"error":"Request body must be valid JSON"}`. Test 48 → `404 {"error":"Route not found: GET /api/nope"}`.
- v1 passed test 48 only because the status code was right; the body wasn't JSON. The suite checks status codes, so the bodies were also inspected by hand.

### 5. Wrong types, blank values, typos and empty updates were accepted — *Accuracy*

**Finding.**
- `borrowerName: 123` and `purpose: true` were stored as `"123.0"` and `"1.0"` (D1 coerced them).
- A blank `"   "` name passed the `!value` check.
- A typo such as `startTime` was silently ignored.
- `PATCH {}` returned `200` while changing nothing.

These break the gate's check that *"booking fields … contain the correct values"*.

**Action taken.** `validateCreate` and `validateUpdate` in [src/validation.ts](src/validation.ts):
- check every field is a string, trim it, and reject blanks;
- enforce maximum lengths;
- reject unknown fields and non-object bodies;
- require at least one field on PATCH.

**Evidence.**
- v1: tests 23, 24, 27 and 38 FAIL.
- Final: tests 23, 24, 27, 28 and 38 → `400`, each naming the bad field.

### 6. Decisions weren't written down or tested — *Reasoning / You Own It*

**Finding.** v1 behaved in ways that were never stated or tested:
- Unknown `equipmentId` returns 400 (why not 404?).
- Back-to-back bookings are allowed.
- A PATCH excludes itself from the overlap check (the gate's own example).
- PATCH checks 404 before 400.

The gate's Reasoning section asks for exactly these explanations, and they would be hard to defend in the ownership questions if they existed only in the code.

**Action taken.**
- Wrote the reasoning into [API_CONTRACT.md](API_CONTRACT.md) ("Why these status codes", "Business rules", "Assumptions") and [SCHEMA.md](SCHEMA.md) ("Design choices").
- Added comments at each decision point in the code.
- Added tests that pin each decision.

**Evidence.**
- Test 12: back-to-back 11:00–12:00 → `201`.
- Test 34: shifting a booking over its own old slot → `200`. This is the gate's example, covered.
- Test 21: unknown `equipmentId` → `400`.
- Test 44: after a delete the same slot books → `201`, which shows that 409 depends on current state, unlike 400.

## Final Quality Gate check

### 1. Purpose
- [x] Solves the equipment-booking problem: bookings with overlap prevention per equipment.
- [x] Routes, bodies, responses and status codes match the common contract. Guide steps 1–9 all pass (tests 1–9).
- [x] Required deliverables are present (see [README.md](README.md), "Submission contents").
- [x] No unrelated features. Extras are limited to validation and tests of the required rules.

### 2. Reliability
- [x] Data is saved and read back consistently. Tests 4 and 40 read back what was written.
- [x] Create and update can't create an overlap. Tests 7, 29–32 and 35 return `409`, and the check is atomic (finding 3).
- [x] `equipmentId` is checked against existing equipment (tests 21 and 37), with a foreign key as a backup.
- [x] Invalid requests don't crash the API (finding 4, tests 22–28).

### 3. Course Context
- [x] Follows the task, the contract and the course stack (Hono, TypeScript, D1).
- [x] AI assistance is identified in [AI_LOG.md](AI_LOG.md).
- [x] Significant AI use is recorded in `AI_LOG.md`.
- [x] Key files, routes, schema and commands are listed in [README.md](README.md).

### 4. Reasoning
- [x] 400, 404 and 409 choices are explained in [API_CONTRACT.md](API_CONTRACT.md), "Why these status codes".
- [x] The overlap check for create and update is explained in [API_CONTRACT.md](API_CONTRACT.md), "Business rules", and in code comments.
- [x] Required behaviour vs optional design choices: see the [API_CONTRACT.md](API_CONTRACT.md) "Assumptions" and [SCHEMA.md](SCHEMA.md) "Design choices" sections.
- [x] Limitations are stated: no auth, past bookings allowed, the race test can't prove atomicity locally.

### 5. Execution Value
- [x] Runs by following [README.md](README.md), verified from a clean database.
- [x] The equipment endpoint and all booking CRUD endpoints work (tests 1–9).
- [x] Tested with curl, with results recorded in [TEST_EVIDENCE.md](TEST_EVIDENCE.md).
- [x] Effort went into the API, validation, tests and docs. There is no frontend.

### 6. Accuracy
- [x] Fields, dates, ids and responses are correct. Times are normalised to UTC (finding 1).
- [x] `startAt` < `endAt` is validated (tests 6, 19, 20 and 36), with a `CHECK` constraint as a backup.
- [x] Every error is `{ "error": "..." }`, including 404s for unknown routes and 500s (finding 4).
- [x] Parameter binding is used everywhere. Tests 45–47 attempt SQL injection.

### 7. Delivery Quality
- [x] Runnable source and README run instructions.
- [x] API contract ([API_CONTRACT.md](API_CONTRACT.md)) and schema/ERD ([SCHEMA.md](SCHEMA.md)) are included.
- [x] CORS isn't configured because no browser client is used, which matches the brief.
- [x] 49 test cases, covering successes and errors.
- [x] Files are named as the brief asks.

### 8. You Own It
- [x] I can explain each route, validation rule, query and test result.
- [x] `AI_LOG.md` records the prompts, what was used and how it was checked.
- [x] I can explain what changed after the review and why (findings 1–6).
- [x] I'm ready for follow-up questions.

## Submission Decision

**READY.** All required work is complete, the 49/49 test run is recorded, and the instructor's 9 guide steps pass.
