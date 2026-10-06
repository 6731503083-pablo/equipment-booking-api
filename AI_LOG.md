# AI Log

**Tool:** Claude Code (model: Claude Opus 5.5), run in VS Code in this project folder.
**Extent of use:** AI was used heavily. Claude wrote the source code, migration, test script and documentation, ran the tests, and carried out the Quality Gate review. This log records what was asked, what was produced and what was verified, so the work can be checked.

## Prompts

| # | Prompt (as typed) | What the AI did |
|---|---|---|
| 1 | "read two md files in this directory" | Read `exam_brief_en.md` and `rubric_en.md` and summarised the requirements. It pointed out that `curl_test_guide.md`, `quality_gate.md` and the starter repo were referenced but missing. |
| 2 | Pasted the brief's Scenario section ("this is also provided") | Confirmed it matched the brief and asked about the starter repository. |
| 3 | "i just need you to do everything for this test ok?" | Built the whole submission (details below). |

## What the AI produced, and what was used

| Output | Used? | Notes |
|---|---|---|
| Project setup copied from my earlier `mini-lab-d1` project (Hono + D1 + wrangler) | Yes | Same stack and versions as the course projects. |
| Schema `migrations/0001_init.sql` | Yes | |
| v1 API, `src/index.ts` (snapshot `v1-snapshot`) | Replaced by v2 | Kept in git history as the "before" for the Quality Gate. |
| Edge-case probes of v1 | Yes | They found the timezone overlap bug, the 500 on bad JSON and type coercion. |
| v2 API: `src/index.ts`, `src/validation.ts` | Yes | |
| `tests/curl-tests.sh` (40 curl cases) | Yes | |
| `API_CONTRACT.md`, `SCHEMA.md`, `QUALITY_GATE_REVIEW.md`, `README.md`, this log | Yes | |

## Points where AI output was checked rather than trusted

- **Date parsing.** Before writing the validator, `Date.parse` was tested in Node. It showed that `2026-02-30` rolls over to March 2 and that a time with no timezone is read in local time. That evidence drove finding 2.
- **The tests themselves.** The full suite was run against the v1 snapshot as well. It fails 8 cases there, which shows the tests can detect the bugs they claim to cover, and that a final "40/40 passed" isn't an empty result.
- **Database claims.** `SCHEMA.md` says the foreign key and the `CHECK` constraint are enforced. Both were tried directly against local D1 with invalid rows, and both were rejected.
- **SQL injection.** Every `prepare(...)` call was reviewed for concatenated request data (none), and injection strings were sent in tests 36–38.
- **A limitation the AI reported rather than overclaimed.** The parallel-request test (40) can't prove race safety on local `wrangler dev`, and `QUALITY_GATE_REVIEW.md` says so.

## Verified by me (the student)

<!-- Fill this in yourself. Only tick what you actually did. -->

- [ ] Ran `npm install`, `npm run db:reset`, `npm run dev` and `npm run test:curl` on my machine and got 40/40
- [ ] Ran at least one curl request by hand and compared it with `TEST_EVIDENCE.md`
- [ ] Read `src/index.ts` and `src/validation.ts` and can explain each route
- [ ] Can explain the overlap condition `existing.start < new.end AND new.start < existing.end`, and why back-to-back is allowed
- [ ] Can explain why times are converted to UTC before comparing (finding 1)
- [ ] Can explain why the overlap check is inside the `INSERT` and not a separate `SELECT` (finding 3)
- [ ] Can explain why a missing `equipmentId` is 400 and not 404, and the difference between 400 and 409
- [ ] Can explain how `.bind()` prevents SQL injection

Notes on anything I changed or disagreed with:

-
