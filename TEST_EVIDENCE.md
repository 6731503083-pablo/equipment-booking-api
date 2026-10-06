# Test Evidence

- **Base API URL:** `http://localhost:8787/api`
- **Run at:** 2026-10-06T06:36:28Z
- **Result:** 40 passed, 0 failed, 40 total
- **How:** `npm run test:curl` ([tests/curl-tests.sh](tests/curl-tests.sh)) runs each request with `curl`, records the real response, and compares the status code with the expected one. The bookings table is emptied through the API before the run.

## Read equipment

### 1. List equipment — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/equipment"
```

```json
[{"id":"eq-1","name":"Projector A","location":"Building 1"},{"id":"eq-2","name":"Camera Canon EOS R6","location":"Building 2"},{"id":"eq-3","name":"Meeting Room M-301","location":"Building 3"}]
```

## Create (POST /bookings)

### 2. Create a valid booking (eq-1, 09:00–11:00Z) — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}'
```

```json
{"id":"7f7936a6-afff-4332-bfb4-5952130a7918","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation","createdAt":"2026-10-06T06:36:28.634Z","updatedAt":"2026-10-06T06:36:28.634Z"}
```

### 3. Back-to-back booking 11:00–12:00Z on eq-1 is allowed — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Malee Sukjai","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Seminar"}'
```

```json
{"id":"69e3e8cf-4870-4746-b83a-05b55ae34b9a","equipmentId":"eq-1","borrowerName":"Malee Sukjai","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Seminar","createdAt":"2026-10-06T06:36:28.672Z","updatedAt":"2026-10-06T06:36:28.672Z"}
```

### 4. Same time on different equipment (eq-2) is allowed — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-2","borrowerName":"Anan Dee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Photo shoot"}'
```

```json
{"id":"6f29be14-d3bb-4a0e-9009-29735b55bf1f","equipmentId":"eq-2","borrowerName":"Anan Dee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Photo shoot","createdAt":"2026-10-06T06:36:28.712Z","updatedAt":"2026-10-06T06:36:28.712Z"}
```

### 5. Time given with +07:00 offset is stored in UTC — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-3","borrowerName":"Niran Ok","startAt":"2026-10-21T09:00:00+07:00","endAt":"2026-10-21T10:30:00+07:00","purpose":"Team meeting"}'
```

```json
{"id":"05745c85-9ec1-4e30-b32d-dfab058aa548","equipmentId":"eq-3","borrowerName":"Niran Ok","startAt":"2026-10-21T02:00:00.000Z","endAt":"2026-10-21T03:30:00.000Z","purpose":"Team meeting","createdAt":"2026-10-06T06:36:28.727Z","updatedAt":"2026-10-06T06:36:28.727Z"}
```

## Read bookings

### 6. List bookings — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings"
```

```json
[{"id":"6f29be14-d3bb-4a0e-9009-29735b55bf1f","equipmentId":"eq-2","borrowerName":"Anan Dee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Photo shoot","createdAt":"2026-10-06T06:36:28.712Z","updatedAt":"2026-10-06T06:36:28.712Z"},{"id":"7f7936a6-afff-4332-bfb4-5952130a7918","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation","createdAt":"2026-10-06T06:36:28.634Z","updatedAt":"2026-10-06T06:36:28.634Z"},{"id":"69e3e8cf-4870-4746-b83a-05b55ae34b9a","equipmentId":"eq-1","borrowerName":"Malee Sukjai","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Seminar","createdAt":"2026-10-06T06:36:28.672Z","updatedAt":"2026-10-06T06:36:28.672Z"},{"id":"05745c85-9ec1-4e30-b32d-dfab058aa548","equipmentId":"eq-3","borrowerName":"Niran Ok","startAt":"2026-10-21T02:00:00.000Z","endAt":"2026-10-21T03:30:00.000Z","purpose":"Team meeting","createdAt":"2026-10-06T06:36:28.727Z","updatedAt":"2026-10-06T06:36:28.727Z"}]
```

### 7. Get one booking by id — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings/7f7936a6-afff-4332-bfb4-5952130a7918"
```

```json
{"id":"7f7936a6-afff-4332-bfb4-5952130a7918","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation","createdAt":"2026-10-06T06:36:28.634Z","updatedAt":"2026-10-06T06:36:28.634Z"}
```

### 8. Get a booking that does not exist — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/does-not-exist"
```

```json
{"error":"Booking not found: does-not-exist"}
```

## Validation errors (400)

### 9. Missing required fields — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee"}'
```

```json
{"error":"Missing required field(s): startAt, endAt, purpose"}
```

### 10. startAt after endAt — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-22T11:00:00.000Z","endAt":"2026-10-22T09:00:00.000Z","purpose":"Backwards"}'
```

```json
{"error":"startAt must be before endAt"}
```

### 11. startAt equal to endAt (zero length) — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T09:00:00.000Z","purpose":"Zero length"}'
```

```json
{"error":"startAt must be before endAt"}
```

### 12. equipmentId that does not exist — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-999","borrowerName":"Somchai Jaidee","startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T10:00:00.000Z","purpose":"Ghost equipment"}'
```

```json
{"error":"equipmentId does not exist: eq-999"}
```

### 13. Malformed JSON body — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId": "eq-1",'
```

```json
{"error":"Request body must be valid JSON"}
```

### 14. Wrong types (number / boolean) — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":123,"startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T10:00:00.000Z","purpose":true}'
```

```json
{"error":"borrowerName must be a string"}
```

### 15. Blank borrowerName — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"   ","startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T10:00:00.000Z","purpose":"Blank name"}'
```

```json
{"error":"borrowerName must not be empty"}
```

### 16. Impossible date 2026-02-30 — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-02-30T09:00:00.000Z","endAt":"2026-02-30T10:00:00.000Z","purpose":"No such day"}'
```

```json
{"error":"startAt is not a real date/time: 2026-02-30T09:00:00.000Z"}
```

### 17. Date-time without timezone — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-22T09:00:00","endAt":"2026-10-22T10:00:00","purpose":"Ambiguous"}'
```

```json
{"error":"startAt must be an ISO 8601 date-time with a timezone, e.g. 2026-10-20T09:00:00.000Z"}
```

### 18. Unknown field (typo startTime) — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startTime":"2026-10-22T09:00:00.000Z","startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T10:00:00.000Z","purpose":"Typo"}'
```

```json
{"error":"Unknown field(s): startTime. Allowed: equipmentId, borrowerName, startAt, endAt, purpose"}
```

### 19. Body is a JSON array, not an object — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '[1,2,3]'
```

```json
{"error":"Request body must be a JSON object"}
```

## Overlap conflicts (409)

### 20. Overlapping booking on eq-1 (10:00–12:00Z) — **PASS**

Expected `409`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somsak Rakdee","startAt":"2026-10-20T10:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Clash"}'
```

```json
{"error":"Equipment eq-1 is already booked for an overlapping time"}
```

### 21. Booking fully inside an existing one (09:30–10:00Z) — **PASS**

Expected `409`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somsak Rakdee","startAt":"2026-10-20T09:30:00.000Z","endAt":"2026-10-20T10:00:00.000Z","purpose":"Inside"}'
```

```json
{"error":"Equipment eq-1 is already booked for an overlapping time"}
```

### 22. Booking that covers an existing one (08:00–13:00Z) — **PASS**

Expected `409`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somsak Rakdee","startAt":"2026-10-20T08:00:00.000Z","endAt":"2026-10-20T13:00:00.000Z","purpose":"Around"}'
```

```json
{"error":"Equipment eq-1 is already booked for an overlapping time"}
```

### 23. Overlap written as +07:00 (15:00+07:00 = 08:00Z, overlaps 09:00Z) — **PASS**

Expected `409`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somsak Rakdee","startAt":"2026-10-20T15:00:00+07:00","endAt":"2026-10-20T17:00:00+07:00","purpose":"Offset clash"}'
```

```json
{"error":"Equipment eq-1 is already booked for an overlapping time"}
```

## Update (PATCH /bookings/:id)

### 24. Update purpose only — **PASS**

Expected `200`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/7f7936a6-afff-4332-bfb4-5952130a7918" -H 'Content-Type: application/json' -d '{"purpose":"Final project presentation"}'
```

```json
{"id":"7f7936a6-afff-4332-bfb4-5952130a7918","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Final project presentation","createdAt":"2026-10-06T06:36:28.634Z","updatedAt":"2026-10-06T06:36:28.850Z"}
```

### 25. Move booking 30 min earlier (overlaps only its own old slot) — **PASS**

Expected `200`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/7f7936a6-afff-4332-bfb4-5952130a7918" -H 'Content-Type: application/json' -d '{"startAt":"2026-10-20T08:30:00.000Z","endAt":"2026-10-20T10:30:00.000Z"}'
```

```json
{"id":"7f7936a6-afff-4332-bfb4-5952130a7918","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T08:30:00.000Z","endAt":"2026-10-20T10:30:00.000Z","purpose":"Final project presentation","createdAt":"2026-10-06T06:36:28.634Z","updatedAt":"2026-10-06T06:36:28.856Z"}
```

### 26. Extend into the next booking → conflict — **PASS**

Expected `409`, got `409`

```bash
curl -s -X PATCH "$BASE_URL/bookings/7f7936a6-afff-4332-bfb4-5952130a7918" -H 'Content-Type: application/json' -d '{"endAt":"2026-10-20T11:30:00.000Z"}'
```

```json
{"error":"Equipment eq-1 is already booked for an overlapping time"}
```

### 27. Set endAt before the stored startAt — **PASS**

Expected `400`, got `400`

```bash
curl -s -X PATCH "$BASE_URL/bookings/7f7936a6-afff-4332-bfb4-5952130a7918" -H 'Content-Type: application/json' -d '{"endAt":"2026-10-20T08:00:00.000Z"}'
```

```json
{"error":"startAt must be before endAt"}
```

### 28. Move to equipment that does not exist — **PASS**

Expected `400`, got `400`

```bash
curl -s -X PATCH "$BASE_URL/bookings/7f7936a6-afff-4332-bfb4-5952130a7918" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-999"}'
```

```json
{"error":"equipmentId does not exist: eq-999"}
```

### 29. Empty update body {} — **PASS**

Expected `400`, got `400`

```bash
curl -s -X PATCH "$BASE_URL/bookings/7f7936a6-afff-4332-bfb4-5952130a7918" -H 'Content-Type: application/json' -d '{}'
```

```json
{"error":"Provide at least one field to update: equipmentId, borrowerName, startAt, endAt, purpose"}
```

### 30. Update a booking that does not exist — **PASS**

Expected `404`, got `404`

```bash
curl -s -X PATCH "$BASE_URL/bookings/does-not-exist" -H 'Content-Type: application/json' -d '{"purpose":"x"}'
```

```json
{"error":"Booking not found: does-not-exist"}
```

### 31. Get booking after updates (shows saved changes) — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings/7f7936a6-afff-4332-bfb4-5952130a7918"
```

```json
{"id":"7f7936a6-afff-4332-bfb4-5952130a7918","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T08:30:00.000Z","endAt":"2026-10-20T10:30:00.000Z","purpose":"Final project presentation","createdAt":"2026-10-06T06:36:28.634Z","updatedAt":"2026-10-06T06:36:28.856Z"}
```

## Delete (DELETE /bookings/:id)

### 32. Delete a booking — **PASS**

Expected `204`, got `204`

```bash
curl -s -X DELETE "$BASE_URL/bookings/69e3e8cf-4870-4746-b83a-05b55ae34b9a"
```

```json
(empty body)
```

### 33. Get the deleted booking — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/69e3e8cf-4870-4746-b83a-05b55ae34b9a"
```

```json
{"error":"Booking not found: 69e3e8cf-4870-4746-b83a-05b55ae34b9a"}
```

### 34. Delete it again — **PASS**

Expected `404`, got `404`

```bash
curl -s -X DELETE "$BASE_URL/bookings/69e3e8cf-4870-4746-b83a-05b55ae34b9a"
```

```json
{"error":"Booking not found: 69e3e8cf-4870-4746-b83a-05b55ae34b9a"}
```

### 35. Slot freed by delete can be booked again — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Malee Sukjai","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Rebooked"}'
```

```json
{"id":"efc1dab1-b819-44bf-b5c5-e2b9b620c643","equipmentId":"eq-1","borrowerName":"Malee Sukjai","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Rebooked","createdAt":"2026-10-06T06:36:28.921Z","updatedAt":"2026-10-06T06:36:28.921Z"}
```

## Security and robustness

### 36. SQL injection text in the URL is treated as an id — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/x'%20OR%20'1'%3D'1"
```

```json
{"error":"Booking not found: x' OR '1'='1"}
```

### 37. SQL injection text in a field is stored as plain text — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-2","borrowerName":"Robert'); DROP TABLE bookings;--","startAt":"2026-10-23T09:00:00.000Z","endAt":"2026-10-23T10:00:00.000Z","purpose":"Injection test"}'
```

```json
{"id":"14f945a3-cf8b-4d51-9132-dd782577c5fd","equipmentId":"eq-2","borrowerName":"Robert'); DROP TABLE bookings;--","startAt":"2026-10-23T09:00:00.000Z","endAt":"2026-10-23T10:00:00.000Z","purpose":"Injection test","createdAt":"2026-10-06T06:36:28.934Z","updatedAt":"2026-10-06T06:36:28.934Z"}
```

### 38. bookings table still exists after injection attempt — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings"
```

```json
[{"id":"7f7936a6-afff-4332-bfb4-5952130a7918","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T08:30:00.000Z","endAt":"2026-10-20T10:30:00.000Z","purpose":"Final project presentation","createdAt":"2026-10-06T06:36:28.634Z","updatedAt":"2026-10-06T06:36:28.856Z"},{"id":"6f29be14-d3bb-4a0e-9009-29735b55bf1f","equipmentId":"eq-2","borrowerName":"Anan Dee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Photo shoot","createdAt":"2026-10-06T06:36:28.712Z","updatedAt":"2026-10-06T06:36:28.712Z"},{"id":"efc1dab1-b819-44bf-b5c5-e2b9b620c643","equipmentId":"eq-1","borrowerName":"Malee Sukjai","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Rebooked","createdAt":"2026-10-06T06:36:28.921Z","updatedAt":"2026-10-06T06:36:28.921Z"},{"id":"05745c85-9ec1-4e30-b32d-dfab058aa548","equipmentId":"eq-3","borrowerName":"Niran Ok","startAt":"2026-10-21T02:00:00.000Z","endAt":"2026-10-21T03:30:00.000Z","purpose":"Team meeting","createdAt":"2026-10-06T06:36:28.727Z","updatedAt":"2026-10-06T06:36:28.727Z"},{"id":"14f945a3-cf8b-4d51-9132-dd782577c5fd","equipmentId":"eq-2","borrowerName":"Robert'); DROP TABLE bookings;--","startAt":"2026-10-23T09:00:00.000Z","endAt":"2026-10-23T10:00:00.000Z","purpose":"Injection test","createdAt":"2026-10-06T06:36:28.934Z","updatedAt":"2026-10-06T06:36:28.934Z"}]
```

### 39. Unknown route returns a JSON 404 — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/nope"
```

```json
{"error":"Route not found: GET /api/nope"}
```

## Concurrent overlapping requests

### 40. 5 parallel identical bookings → exactly one 201, four 409 — **PASS**

Status codes received: `201 409 409 409 409` (201 × 1, 409 × 4)

Note: local `wrangler dev` may handle these one at a time, so this run shows the result is correct but doesn't prove the race is safe. The guarantee comes from the single-statement `INSERT … WHERE NOT EXISTS` (see QUALITY_GATE_REVIEW.md, finding 4).

## Summary

**40 passed, 0 failed, 40 total.**
