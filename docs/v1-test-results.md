# Test Evidence — v1 snapshot (before the Quality Gate fixes)

- **Base API URL:** `http://localhost:8788/api` (the **v1 snapshot** code, run on a second port so it could be compared with v2)
- **Run at:** 2026-10-06T06:34:07Z
- **Result:** 32 passed, 8 failed, 40 total
- **How:** `npm run test:curl` ([tests/curl-tests.sh](../tests/curl-tests.sh)) runs each request with `curl`, records the real response, and compares the status code with the expected one. The bookings table is emptied through the API before the run.

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
{"id":"0661e56a-8fa3-4777-aa36-ba67f315c0e3","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation","createdAt":"2026-10-06T06:34:07.109Z","updatedAt":"2026-10-06T06:34:07.109Z"}
```

### 3. Back-to-back booking 11:00–12:00Z on eq-1 is allowed — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Malee Sukjai","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Seminar"}'
```

```json
{"id":"c1aa408b-a66d-4a53-a206-c4f2c8e168b5","equipmentId":"eq-1","borrowerName":"Malee Sukjai","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Seminar","createdAt":"2026-10-06T06:34:07.147Z","updatedAt":"2026-10-06T06:34:07.147Z"}
```

### 4. Same time on different equipment (eq-2) is allowed — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-2","borrowerName":"Anan Dee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Photo shoot"}'
```

```json
{"id":"19cd264f-3dae-4407-9040-cf1928a02b4b","equipmentId":"eq-2","borrowerName":"Anan Dee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Photo shoot","createdAt":"2026-10-06T06:34:07.185Z","updatedAt":"2026-10-06T06:34:07.185Z"}
```

### 5. Time given with +07:00 offset is stored in UTC — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-3","borrowerName":"Niran Ok","startAt":"2026-10-21T09:00:00+07:00","endAt":"2026-10-21T10:30:00+07:00","purpose":"Team meeting"}'
```

```json
{"id":"bc34f433-aafd-4d6d-a16c-a581f4dbd538","equipmentId":"eq-3","borrowerName":"Niran Ok","startAt":"2026-10-21T09:00:00+07:00","endAt":"2026-10-21T10:30:00+07:00","purpose":"Team meeting","createdAt":"2026-10-06T06:34:07.192Z","updatedAt":"2026-10-06T06:34:07.192Z"}
```

## Read bookings

### 6. List bookings — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings"
```

```json
[{"id":"0661e56a-8fa3-4777-aa36-ba67f315c0e3","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation","createdAt":"2026-10-06T06:34:07.109Z","updatedAt":"2026-10-06T06:34:07.109Z"},{"id":"19cd264f-3dae-4407-9040-cf1928a02b4b","equipmentId":"eq-2","borrowerName":"Anan Dee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Photo shoot","createdAt":"2026-10-06T06:34:07.185Z","updatedAt":"2026-10-06T06:34:07.185Z"},{"id":"c1aa408b-a66d-4a53-a206-c4f2c8e168b5","equipmentId":"eq-1","borrowerName":"Malee Sukjai","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Seminar","createdAt":"2026-10-06T06:34:07.147Z","updatedAt":"2026-10-06T06:34:07.147Z"},{"id":"bc34f433-aafd-4d6d-a16c-a581f4dbd538","equipmentId":"eq-3","borrowerName":"Niran Ok","startAt":"2026-10-21T09:00:00+07:00","endAt":"2026-10-21T10:30:00+07:00","purpose":"Team meeting","createdAt":"2026-10-06T06:34:07.192Z","updatedAt":"2026-10-06T06:34:07.192Z"}]
```

### 7. Get one booking by id — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings/0661e56a-8fa3-4777-aa36-ba67f315c0e3"
```

```json
{"id":"0661e56a-8fa3-4777-aa36-ba67f315c0e3","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation","createdAt":"2026-10-06T06:34:07.109Z","updatedAt":"2026-10-06T06:34:07.109Z"}
```

### 8. Get a booking that does not exist — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/does-not-exist"
```

```json
{"error":"Booking not found"}
```

## Validation errors (400)

### 9. Missing required fields — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee"}'
```

```json
{"error":"equipmentId, borrowerName, startAt, endAt and purpose are required"}
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
{"error":"equipmentId does not exist"}
```

### 13. Malformed JSON body — **FAIL**

Expected `400`, got `500`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId": "eq-1",'
```

```json
Internal Server Error
```

### 14. Wrong types (number / boolean) — **FAIL**

Expected `400`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":123,"startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T10:00:00.000Z","purpose":true}'
```

```json
{"id":"569b602c-224b-4827-9769-517e09079dde","equipmentId":"eq-1","borrowerName":"123.0","startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T10:00:00.000Z","purpose":"1.0","createdAt":"2026-10-06T06:34:07.248Z","updatedAt":"2026-10-06T06:34:07.248Z"}
```

### 15. Blank borrowerName — **FAIL**

Expected `400`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"   ","startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T10:00:00.000Z","purpose":"Blank name"}'
```

```json
{"error":"This equipment is already booked for an overlapping time"}
```

### 16. Impossible date 2026-02-30 — **FAIL**

Expected `400`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-02-30T09:00:00.000Z","endAt":"2026-02-30T10:00:00.000Z","purpose":"No such day"}'
```

```json
{"id":"1e5a4a19-00a0-4702-90f5-7282cc1ea1a1","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-02-30T09:00:00.000Z","endAt":"2026-02-30T10:00:00.000Z","purpose":"No such day","createdAt":"2026-10-06T06:34:07.264Z","updatedAt":"2026-10-06T06:34:07.264Z"}
```

### 17. Date-time without timezone — **FAIL**

Expected `400`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-22T09:00:00","endAt":"2026-10-22T10:00:00","purpose":"Ambiguous"}'
```

```json
{"error":"This equipment is already booked for an overlapping time"}
```

### 18. Unknown field (typo startTime) — **FAIL**

Expected `400`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startTime":"2026-10-22T09:00:00.000Z","startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T10:00:00.000Z","purpose":"Typo"}'
```

```json
{"error":"This equipment is already booked for an overlapping time"}
```

### 19. Body is a JSON array, not an object — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '[1,2,3]'
```

```json
{"error":"equipmentId, borrowerName, startAt, endAt and purpose are required"}
```

## Overlap conflicts (409)

### 20. Overlapping booking on eq-1 (10:00–12:00Z) — **PASS**

Expected `409`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somsak Rakdee","startAt":"2026-10-20T10:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Clash"}'
```

```json
{"error":"This equipment is already booked for an overlapping time"}
```

### 21. Booking fully inside an existing one (09:30–10:00Z) — **PASS**

Expected `409`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somsak Rakdee","startAt":"2026-10-20T09:30:00.000Z","endAt":"2026-10-20T10:00:00.000Z","purpose":"Inside"}'
```

```json
{"error":"This equipment is already booked for an overlapping time"}
```

### 22. Booking that covers an existing one (08:00–13:00Z) — **PASS**

Expected `409`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somsak Rakdee","startAt":"2026-10-20T08:00:00.000Z","endAt":"2026-10-20T13:00:00.000Z","purpose":"Around"}'
```

```json
{"error":"This equipment is already booked for an overlapping time"}
```

### 23. Overlap written as +07:00 (15:00+07:00 = 08:00Z, overlaps 09:00Z) — **FAIL**

Expected `409`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Somsak Rakdee","startAt":"2026-10-20T15:00:00+07:00","endAt":"2026-10-20T17:00:00+07:00","purpose":"Offset clash"}'
```

```json
{"id":"6c4e7b64-9806-4a9c-a011-e9fb1cc249c6","equipmentId":"eq-1","borrowerName":"Somsak Rakdee","startAt":"2026-10-20T15:00:00+07:00","endAt":"2026-10-20T17:00:00+07:00","purpose":"Offset clash","createdAt":"2026-10-06T06:34:07.310Z","updatedAt":"2026-10-06T06:34:07.310Z"}
```

## Update (PATCH /bookings/:id)

### 24. Update purpose only — **PASS**

Expected `200`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/0661e56a-8fa3-4777-aa36-ba67f315c0e3" -H 'Content-Type: application/json' -d '{"purpose":"Final project presentation"}'
```

```json
{"id":"0661e56a-8fa3-4777-aa36-ba67f315c0e3","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Final project presentation","createdAt":"2026-10-06T06:34:07.109Z","updatedAt":"2026-10-06T06:34:07.317Z"}
```

### 25. Move booking 30 min earlier (overlaps only its own old slot) — **PASS**

Expected `200`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/0661e56a-8fa3-4777-aa36-ba67f315c0e3" -H 'Content-Type: application/json' -d '{"startAt":"2026-10-20T08:30:00.000Z","endAt":"2026-10-20T10:30:00.000Z"}'
```

```json
{"id":"0661e56a-8fa3-4777-aa36-ba67f315c0e3","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T08:30:00.000Z","endAt":"2026-10-20T10:30:00.000Z","purpose":"Final project presentation","createdAt":"2026-10-06T06:34:07.109Z","updatedAt":"2026-10-06T06:34:07.324Z"}
```

### 26. Extend into the next booking → conflict — **PASS**

Expected `409`, got `409`

```bash
curl -s -X PATCH "$BASE_URL/bookings/0661e56a-8fa3-4777-aa36-ba67f315c0e3" -H 'Content-Type: application/json' -d '{"endAt":"2026-10-20T11:30:00.000Z"}'
```

```json
{"error":"This equipment is already booked for an overlapping time"}
```

### 27. Set endAt before the stored startAt — **PASS**

Expected `400`, got `400`

```bash
curl -s -X PATCH "$BASE_URL/bookings/0661e56a-8fa3-4777-aa36-ba67f315c0e3" -H 'Content-Type: application/json' -d '{"endAt":"2026-10-20T08:00:00.000Z"}'
```

```json
{"error":"startAt must be before endAt"}
```

### 28. Move to equipment that does not exist — **PASS**

Expected `400`, got `400`

```bash
curl -s -X PATCH "$BASE_URL/bookings/0661e56a-8fa3-4777-aa36-ba67f315c0e3" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-999"}'
```

```json
{"error":"equipmentId does not exist"}
```

### 29. Empty update body {} — **FAIL**

Expected `400`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/0661e56a-8fa3-4777-aa36-ba67f315c0e3" -H 'Content-Type: application/json' -d '{}'
```

```json
{"id":"0661e56a-8fa3-4777-aa36-ba67f315c0e3","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T08:30:00.000Z","endAt":"2026-10-20T10:30:00.000Z","purpose":"Final project presentation","createdAt":"2026-10-06T06:34:07.109Z","updatedAt":"2026-10-06T06:34:07.349Z"}
```

### 30. Update a booking that does not exist — **PASS**

Expected `404`, got `404`

```bash
curl -s -X PATCH "$BASE_URL/bookings/does-not-exist" -H 'Content-Type: application/json' -d '{"purpose":"x"}'
```

```json
{"error":"Booking not found"}
```

### 31. Get booking after updates (shows saved changes) — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings/0661e56a-8fa3-4777-aa36-ba67f315c0e3"
```

```json
{"id":"0661e56a-8fa3-4777-aa36-ba67f315c0e3","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T08:30:00.000Z","endAt":"2026-10-20T10:30:00.000Z","purpose":"Final project presentation","createdAt":"2026-10-06T06:34:07.109Z","updatedAt":"2026-10-06T06:34:07.349Z"}
```

## Delete (DELETE /bookings/:id)

### 32. Delete a booking — **PASS**

Expected `204`, got `204`

```bash
curl -s -X DELETE "$BASE_URL/bookings/c1aa408b-a66d-4a53-a206-c4f2c8e168b5"
```

```json
(empty body)
```

### 33. Get the deleted booking — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/c1aa408b-a66d-4a53-a206-c4f2c8e168b5"
```

```json
{"error":"Booking not found"}
```

### 34. Delete it again — **PASS**

Expected `404`, got `404`

```bash
curl -s -X DELETE "$BASE_URL/bookings/c1aa408b-a66d-4a53-a206-c4f2c8e168b5"
```

```json
{"error":"Booking not found"}
```

### 35. Slot freed by delete can be booked again — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-1","borrowerName":"Malee Sukjai","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Rebooked"}'
```

```json
{"id":"c93682d0-7a26-4525-ab81-c4839e429d6e","equipmentId":"eq-1","borrowerName":"Malee Sukjai","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Rebooked","createdAt":"2026-10-06T06:34:07.389Z","updatedAt":"2026-10-06T06:34:07.389Z"}
```

## Security and robustness

### 36. SQL injection text in the URL is treated as an id — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/x'%20OR%20'1'%3D'1"
```

```json
{"error":"Booking not found"}
```

### 37. SQL injection text in a field is stored as plain text — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' -d '{"equipmentId":"eq-2","borrowerName":"Robert'); DROP TABLE bookings;--","startAt":"2026-10-23T09:00:00.000Z","endAt":"2026-10-23T10:00:00.000Z","purpose":"Injection test"}'
```

```json
{"id":"0ea34cda-6a93-4b53-8085-266f88092d27","equipmentId":"eq-2","borrowerName":"Robert'); DROP TABLE bookings;--","startAt":"2026-10-23T09:00:00.000Z","endAt":"2026-10-23T10:00:00.000Z","purpose":"Injection test","createdAt":"2026-10-06T06:34:07.401Z","updatedAt":"2026-10-06T06:34:07.401Z"}
```

### 38. bookings table still exists after injection attempt — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings"
```

```json
[{"id":"1e5a4a19-00a0-4702-90f5-7282cc1ea1a1","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-02-30T09:00:00.000Z","endAt":"2026-02-30T10:00:00.000Z","purpose":"No such day","createdAt":"2026-10-06T06:34:07.264Z","updatedAt":"2026-10-06T06:34:07.264Z"},{"id":"0661e56a-8fa3-4777-aa36-ba67f315c0e3","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T08:30:00.000Z","endAt":"2026-10-20T10:30:00.000Z","purpose":"Final project presentation","createdAt":"2026-10-06T06:34:07.109Z","updatedAt":"2026-10-06T06:34:07.349Z"},{"id":"19cd264f-3dae-4407-9040-cf1928a02b4b","equipmentId":"eq-2","borrowerName":"Anan Dee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Photo shoot","createdAt":"2026-10-06T06:34:07.185Z","updatedAt":"2026-10-06T06:34:07.185Z"},{"id":"c93682d0-7a26-4525-ab81-c4839e429d6e","equipmentId":"eq-1","borrowerName":"Malee Sukjai","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Rebooked","createdAt":"2026-10-06T06:34:07.389Z","updatedAt":"2026-10-06T06:34:07.389Z"},{"id":"6c4e7b64-9806-4a9c-a011-e9fb1cc249c6","equipmentId":"eq-1","borrowerName":"Somsak Rakdee","startAt":"2026-10-20T15:00:00+07:00","endAt":"2026-10-20T17:00:00+07:00","purpose":"Offset clash","createdAt":"2026-10-06T06:34:07.310Z","updatedAt":"2026-10-06T06:34:07.310Z"},{"id":"bc34f433-aafd-4d6d-a16c-a581f4dbd538","equipmentId":"eq-3","borrowerName":"Niran Ok","startAt":"2026-10-21T09:00:00+07:00","endAt":"2026-10-21T10:30:00+07:00","purpose":"Team meeting","createdAt":"2026-10-06T06:34:07.192Z","updatedAt":"2026-10-06T06:34:07.192Z"},{"id":"569b602c-224b-4827-9769-517e09079dde","equipmentId":"eq-1","borrowerName":"123.0","startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T10:00:00.000Z","purpose":"1.0","createdAt":"2026-10-06T06:34:07.248Z","updatedAt":"2026-10-06T06:34:07.248Z"},{"id":"0ea34cda-6a93-4b53-8085-266f88092d27","equipmentId":"eq-2","borrowerName":"Robert'); DROP TABLE bookings;--","startAt":"2026-10-23T09:00:00.000Z","endAt":"2026-10-23T10:00:00.000Z","purpose":"Injection test","createdAt":"2026-10-06T06:34:07.401Z","updatedAt":"2026-10-06T06:34:07.401Z"}]
```

### 39. Unknown route returns a JSON 404 — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/nope"
```

```json
404 Not Found
```

## Concurrent overlapping requests

### 40. 5 parallel identical bookings → exactly one 201, four 409 — **PASS**

Status codes received: `201 409 409 409 409` (201 × 1, 409 × 4)

Note: local `wrangler dev` may handle these one at a time, so this run shows the result is correct but doesn't prove the race is safe. The guarantee comes from the single-statement `INSERT … WHERE NOT EXISTS` (see QUALITY_GATE_REVIEW.md, finding 4).

## Summary

**32 passed, 8 failed, 40 total.**
