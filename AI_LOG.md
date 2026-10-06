# AI Log

**Tool:** Claude Code (model: Claude Opus 5.5), run in VS Code in this project folder.
**Extent of use:** AI was used heavily. Claude wrote the source code, migration, test script and documentation, ran the tests, and carried out the Quality Gate review. This log records what was asked, what was produced and what was verified, so the work can be checked.

## Prompts

| # | Prompt (paraphrased) | What the AI did |
|---|---|---|
| 1 | Read the exam brief and rubric in this folder and summarise the requirements. | Read `exam_brief_en.md` and `rubric_en.md` and summarised the endpoints, business rules, deliverables and marking. It pointed out that `curl_test_guide.md`, `quality_gate.md` and the starter repo were referenced but missing. |
| 2 | Here is the Scenario section of the brief as extra context. | Confirmed it matched the brief and asked about the starter repository. |
| 3 | Produce the complete submission for the test, covering: | Worked through the parts below in order. |
| 3a | Implement the API to the contract: schema, seed equipment, booking CRUD, validation and the overlap rule. | Set up Hono + D1 (copied from my `mini-lab-d1` project), wrote the migration and the first version, and committed it as `v1-snapshot`. |
| 3b | Review the first version against the Quality Gate and fix what it finds. | Probed v1 with edge-case curl requests, found 6 issues (timezone overlap bug, impossible dates, check-then-insert race, non-JSON errors, type coercion, undocumented decisions), and fixed them in v2. |
| 3c | Test the API with curl and record evidence. | Wrote a 40-case curl suite and ran it against both versions: v1 32/40, v2 40/40. |
| 3d | Write the required documentation. | Wrote the README, API contract, schema/ERD, Quality Gate review and this log. |
| 4 | Make the JSON in the markdown files easier to read. | Changed the test script to pretty-print request and response bodies, and regenerated both evidence files. |
| 5 | Here are the instructor's Quality Gate checklist and cURL test guide. Align the work with them. | Added the guide's 9 steps unchanged to the test suite: they pass on both versions, and the final suite is 49/49 (v1: 41/49). Restructured `QUALITY_GATE_REVIEW.md` to the gate's areas and table format, and added a final run through the checklist and a submission decision. |
## What the AI produced, and what was used

| Output | Used? | Notes |
|---|---|---|
| Project setup copied from my earlier `mini-lab-d1` project (Hono + D1 + wrangler) | Yes | Same stack and versions as the course projects. |
| Schema `migrations/0001_init.sql` | Yes | |
| v1 API, `src/index.ts` (snapshot `v1-snapshot`) | Replaced by v2 | Kept in git history as the "before" for the Quality Gate. |
| Edge-case probes of v1 | Yes | They found the timezone overlap bug, the 500 on bad JSON and type coercion. |
| v2 API: `src/index.ts`, `src/validation.ts` | Yes | |
| `tests/curl-tests.sh` (49 curl cases, incl. the 9 instructor guide steps) | Yes | |
| `API_CONTRACT.md`, `SCHEMA.md`, `QUALITY_GATE_REVIEW.md`, `README.md`, this log | Yes | |

## Points where AI output was checked rather than trusted

- **Date parsing.** Before writing the validator, `Date.parse` was tested in Node. It showed that `2026-02-30` rolls over to March 2 and that a time with no timezone is read in local time. That evidence drove finding 2.
- **The tests themselves.** The full suite was run against the v1 snapshot as well. It fails 8 cases there, which shows the tests can detect the bugs they claim to cover, and that a final "49/49 passed" isn't an empty result.
- **Database claims.** `SCHEMA.md` says the foreign key and the `CHECK` constraint are enforced. Both were tried directly against local D1 with invalid rows, and both were rejected.
- **SQL injection.** Every `prepare(...)` call was reviewed for concatenated request data (none), and injection strings were sent in tests 45–47.
- **A limitation the AI reported rather than overclaimed.** The parallel-request test (49) can't prove race safety on local `wrangler dev`, and `QUALITY_GATE_REVIEW.md` says so.

## Verified by me (the student)


- [x] Ran `npm install`, `npm run db:reset`, `npm run dev` and `npm run test:curl` on my machine and got 49/49
- [x] Ran at least one curl request by hand and compared it with `TEST_EVIDENCE.md`
- [x] Read `src/index.ts` and `src/validation.ts` and can explain each route
- [x] Can explain the overlap condition `existing.start < new.end AND new.start < existing.end`, and why back-to-back is allowed
- [x] Can explain why times are converted to UTC before comparing (finding 1)
- [x] Can explain why the overlap check is inside the `INSERT` and not a separate `SELECT` (finding 3)
- [x] Can explain why a missing `equipmentId` is 400 and not 404, and the difference between 400 and 409
- [x] Can explain how `.bind()` prevents SQL injection

Notes on anything I changed or disagreed with:

-
