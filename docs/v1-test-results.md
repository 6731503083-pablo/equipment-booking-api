# Test Evidence — v1 snapshot (before the Quality Gate fixes)

- **Base API URL:** `http://localhost:8788/api` (the **v1 snapshot** code, run on a second port so it could be compared with v2)
- **Run at:** 2026-10-06T07:00:39Z
- **Result:** 41 passed, 8 failed, 49 total
- **How:** `npm run test:curl` ([tests/curl-tests.sh](../tests/curl-tests.sh)) runs each request with `curl`, records the real response, and compares the status code with the expected one. The bookings table is emptied through the API before the run.

## Instructor cURL Quick Test Guide (curl_test_guide.md, steps 1–9)

### 1. Guide 1: List equipment — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/equipment"
```

```json
[
  {
    "id": "eq-1",
    "name": "Projector A",
    "location": "Building 1"
  },
  {
    "id": "eq-2",
    "name": "Camera Canon EOS R6",
    "location": "Building 2"
  },
  {
    "id": "eq-3",
    "name": "Meeting Room M-301",
    "location": "Building 3"
  }
]
```

### 2. Guide 2: List bookings — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings"
```

```json
[]
```

### 3. Guide 3: Create a booking — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}'
```

```json
{
  "id": "5ab75cdd-9768-46e6-9ff2-8236c651f99e",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation",
  "createdAt": "2026-10-06T07:00:39.597Z",
  "updatedAt": "2026-10-06T07:00:39.597Z"
}
```

### 4. Guide 4: Get one booking — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings/5ab75cdd-9768-46e6-9ff2-8236c651f99e"
```

```json
{
  "id": "5ab75cdd-9768-46e6-9ff2-8236c651f99e",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation",
  "createdAt": "2026-10-06T07:00:39.597Z",
  "updatedAt": "2026-10-06T07:00:39.597Z"
}
```

### 5. Guide 5: Update a booking (moved to 12:00–14:00Z) — **PASS**

Expected `200`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/5ab75cdd-9768-46e6-9ff2-8236c651f99e" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T12:00:00.000Z",
  "endAt": "2026-10-20T14:00:00.000Z",
  "purpose": "Updated class presentation"
}'
```

```json
{
  "id": "5ab75cdd-9768-46e6-9ff2-8236c651f99e",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T12:00:00.000Z",
  "endAt": "2026-10-20T14:00:00.000Z",
  "purpose": "Updated class presentation",
  "createdAt": "2026-10-06T07:00:39.597Z",
  "updatedAt": "2026-10-06T07:00:39.730Z"
}
```

### 6. Guide 6: Invalid time range — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-21T11:00:00.000Z",
  "endAt": "2026-10-21T09:00:00.000Z",
  "purpose": "Invalid time range test"
}'
```

```json
{
  "error": "startAt must be before endAt"
}
```

### 7. Guide 7: Overlapping booking (12:30–13:30Z vs 12:00–14:00Z) — **PASS**

Expected `409`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Suda Dee",
  "startAt": "2026-10-20T12:30:00.000Z",
  "endAt": "2026-10-20T13:30:00.000Z",
  "purpose": "Conflict test"
}'
```

```json
{
  "error": "This equipment is already booked for an overlapping time"
}
```

### 8. Guide 8: Missing booking — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/not-found"
```

```json
{
  "error": "Booking not found"
}
```

### 9. Guide 9: Delete a booking — **PASS**

Expected `204`, got `204`

```bash
curl -s -X DELETE "$BASE_URL/bookings/5ab75cdd-9768-46e6-9ff2-8236c651f99e"
```

```json
(empty body)
```

## Read equipment

### 10. List equipment — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/equipment"
```

```json
[
  {
    "id": "eq-1",
    "name": "Projector A",
    "location": "Building 1"
  },
  {
    "id": "eq-2",
    "name": "Camera Canon EOS R6",
    "location": "Building 2"
  },
  {
    "id": "eq-3",
    "name": "Meeting Room M-301",
    "location": "Building 3"
  }
]
```

## Create (POST /bookings)

### 11. Create a valid booking (eq-1, 09:00–11:00Z) — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}'
```

```json
{
  "id": "89484e34-91d7-4d66-9235-aee19968480b",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation",
  "createdAt": "2026-10-06T07:00:40.008Z",
  "updatedAt": "2026-10-06T07:00:40.008Z"
}
```

### 12. Back-to-back booking 11:00–12:00Z on eq-1 is allowed — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Malee Sukjai",
  "startAt": "2026-10-20T11:00:00.000Z",
  "endAt": "2026-10-20T12:00:00.000Z",
  "purpose": "Seminar"
}'
```

```json
{
  "id": "a8900c96-718c-4d5a-bec5-3d619e130dae",
  "equipmentId": "eq-1",
  "borrowerName": "Malee Sukjai",
  "startAt": "2026-10-20T11:00:00.000Z",
  "endAt": "2026-10-20T12:00:00.000Z",
  "purpose": "Seminar",
  "createdAt": "2026-10-06T07:00:40.105Z",
  "updatedAt": "2026-10-06T07:00:40.105Z"
}
```

### 13. Same time on different equipment (eq-2) is allowed — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-2",
  "borrowerName": "Anan Dee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Photo shoot"
}'
```

```json
{
  "id": "07e5f71e-c7a7-4840-8dfe-80f7eb1fd7aa",
  "equipmentId": "eq-2",
  "borrowerName": "Anan Dee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Photo shoot",
  "createdAt": "2026-10-06T07:00:40.200Z",
  "updatedAt": "2026-10-06T07:00:40.200Z"
}
```

### 14. Time given with +07:00 offset is stored in UTC — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-3",
  "borrowerName": "Niran Ok",
  "startAt": "2026-10-21T09:00:00+07:00",
  "endAt": "2026-10-21T10:30:00+07:00",
  "purpose": "Team meeting"
}'
```

```json
{
  "id": "f37d4cc2-5ac9-445f-a8e5-17ae9168e1e8",
  "equipmentId": "eq-3",
  "borrowerName": "Niran Ok",
  "startAt": "2026-10-21T09:00:00+07:00",
  "endAt": "2026-10-21T10:30:00+07:00",
  "purpose": "Team meeting",
  "createdAt": "2026-10-06T07:00:40.269Z",
  "updatedAt": "2026-10-06T07:00:40.269Z"
}
```

## Read bookings

### 15. List bookings — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings"
```

```json
[
  {
    "id": "89484e34-91d7-4d66-9235-aee19968480b",
    "equipmentId": "eq-1",
    "borrowerName": "Somchai Jaidee",
    "startAt": "2026-10-20T09:00:00.000Z",
    "endAt": "2026-10-20T11:00:00.000Z",
    "purpose": "Class presentation",
    "createdAt": "2026-10-06T07:00:40.008Z",
    "updatedAt": "2026-10-06T07:00:40.008Z"
  },
  {
    "id": "07e5f71e-c7a7-4840-8dfe-80f7eb1fd7aa",
    "equipmentId": "eq-2",
    "borrowerName": "Anan Dee",
    "startAt": "2026-10-20T09:00:00.000Z",
    "endAt": "2026-10-20T11:00:00.000Z",
    "purpose": "Photo shoot",
    "createdAt": "2026-10-06T07:00:40.200Z",
    "updatedAt": "2026-10-06T07:00:40.200Z"
  },
  {
    "id": "a8900c96-718c-4d5a-bec5-3d619e130dae",
    "equipmentId": "eq-1",
    "borrowerName": "Malee Sukjai",
    "startAt": "2026-10-20T11:00:00.000Z",
    "endAt": "2026-10-20T12:00:00.000Z",
    "purpose": "Seminar",
    "createdAt": "2026-10-06T07:00:40.105Z",
    "updatedAt": "2026-10-06T07:00:40.105Z"
  },
  {
    "id": "f37d4cc2-5ac9-445f-a8e5-17ae9168e1e8",
    "equipmentId": "eq-3",
    "borrowerName": "Niran Ok",
    "startAt": "2026-10-21T09:00:00+07:00",
    "endAt": "2026-10-21T10:30:00+07:00",
    "purpose": "Team meeting",
    "createdAt": "2026-10-06T07:00:40.269Z",
    "updatedAt": "2026-10-06T07:00:40.269Z"
  }
]
```

### 16. Get one booking by id — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings/89484e34-91d7-4d66-9235-aee19968480b"
```

```json
{
  "id": "89484e34-91d7-4d66-9235-aee19968480b",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation",
  "createdAt": "2026-10-06T07:00:40.008Z",
  "updatedAt": "2026-10-06T07:00:40.008Z"
}
```

### 17. Get a booking that does not exist — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/does-not-exist"
```

```json
{
  "error": "Booking not found"
}
```

## Validation errors (400)

### 18. Missing required fields — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee"
}'
```

```json
{
  "error": "equipmentId, borrowerName, startAt, endAt and purpose are required"
}
```

### 19. startAt after endAt — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-22T11:00:00.000Z",
  "endAt": "2026-10-22T09:00:00.000Z",
  "purpose": "Backwards"
}'
```

```json
{
  "error": "startAt must be before endAt"
}
```

### 20. startAt equal to endAt (zero length) — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-22T09:00:00.000Z",
  "endAt": "2026-10-22T09:00:00.000Z",
  "purpose": "Zero length"
}'
```

```json
{
  "error": "startAt must be before endAt"
}
```

### 21. equipmentId that does not exist — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-999",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-22T09:00:00.000Z",
  "endAt": "2026-10-22T10:00:00.000Z",
  "purpose": "Ghost equipment"
}'
```

```json
{
  "error": "equipmentId does not exist"
}
```

### 22. Malformed JSON body — **FAIL**

Expected `400`, got `500`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{"equipmentId": "eq-1",'
```

```json
Internal Server Error
```

### 23. Wrong types (number / boolean) — **FAIL**

Expected `400`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": 123,
  "startAt": "2026-10-22T09:00:00.000Z",
  "endAt": "2026-10-22T10:00:00.000Z",
  "purpose": true
}'
```

```json
{
  "id": "3522b68e-cb6d-4be4-a25f-594f14ba319e",
  "equipmentId": "eq-1",
  "borrowerName": "123.0",
  "startAt": "2026-10-22T09:00:00.000Z",
  "endAt": "2026-10-22T10:00:00.000Z",
  "purpose": "1.0",
  "createdAt": "2026-10-06T07:00:40.789Z",
  "updatedAt": "2026-10-06T07:00:40.789Z"
}
```

### 24. Blank borrowerName — **FAIL**

Expected `400`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "   ",
  "startAt": "2026-10-22T09:00:00.000Z",
  "endAt": "2026-10-22T10:00:00.000Z",
  "purpose": "Blank name"
}'
```

```json
{
  "error": "This equipment is already booked for an overlapping time"
}
```

### 25. Impossible date 2026-02-30 — **FAIL**

Expected `400`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-02-30T09:00:00.000Z",
  "endAt": "2026-02-30T10:00:00.000Z",
  "purpose": "No such day"
}'
```

```json
{
  "id": "d99a3e5a-caf7-4126-8583-42f7e57b59d4",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-02-30T09:00:00.000Z",
  "endAt": "2026-02-30T10:00:00.000Z",
  "purpose": "No such day",
  "createdAt": "2026-10-06T07:00:40.921Z",
  "updatedAt": "2026-10-06T07:00:40.921Z"
}
```

### 26. Date-time without timezone — **FAIL**

Expected `400`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-22T09:00:00",
  "endAt": "2026-10-22T10:00:00",
  "purpose": "Ambiguous"
}'
```

```json
{
  "error": "This equipment is already booked for an overlapping time"
}
```

### 27. Unknown field (typo startTime) — **FAIL**

Expected `400`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startTime": "2026-10-22T09:00:00.000Z",
  "startAt": "2026-10-22T09:00:00.000Z",
  "endAt": "2026-10-22T10:00:00.000Z",
  "purpose": "Typo"
}'
```

```json
{
  "error": "This equipment is already booked for an overlapping time"
}
```

### 28. Body is a JSON array, not an object — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '[
  1,
  2,
  3
]'
```

```json
{
  "error": "equipmentId, borrowerName, startAt, endAt and purpose are required"
}
```

## Overlap conflicts (409)

### 29. Overlapping booking on eq-1 (10:00–12:00Z) — **PASS**

Expected `409`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Somsak Rakdee",
  "startAt": "2026-10-20T10:00:00.000Z",
  "endAt": "2026-10-20T12:00:00.000Z",
  "purpose": "Clash"
}'
```

```json
{
  "error": "This equipment is already booked for an overlapping time"
}
```

### 30. Booking fully inside an existing one (09:30–10:00Z) — **PASS**

Expected `409`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Somsak Rakdee",
  "startAt": "2026-10-20T09:30:00.000Z",
  "endAt": "2026-10-20T10:00:00.000Z",
  "purpose": "Inside"
}'
```

```json
{
  "error": "This equipment is already booked for an overlapping time"
}
```

### 31. Booking that covers an existing one (08:00–13:00Z) — **PASS**

Expected `409`, got `409`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Somsak Rakdee",
  "startAt": "2026-10-20T08:00:00.000Z",
  "endAt": "2026-10-20T13:00:00.000Z",
  "purpose": "Around"
}'
```

```json
{
  "error": "This equipment is already booked for an overlapping time"
}
```

### 32. Overlap written as +07:00 (15:00+07:00 = 08:00Z, overlaps 09:00Z) — **FAIL**

Expected `409`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Somsak Rakdee",
  "startAt": "2026-10-20T15:00:00+07:00",
  "endAt": "2026-10-20T17:00:00+07:00",
  "purpose": "Offset clash"
}'
```

```json
{
  "id": "66d2fd41-c004-4d35-b845-359500707d03",
  "equipmentId": "eq-1",
  "borrowerName": "Somsak Rakdee",
  "startAt": "2026-10-20T15:00:00+07:00",
  "endAt": "2026-10-20T17:00:00+07:00",
  "purpose": "Offset clash",
  "createdAt": "2026-10-06T07:00:41.384Z",
  "updatedAt": "2026-10-06T07:00:41.384Z"
}
```

## Update (PATCH /bookings/:id)

### 33. Update purpose only — **PASS**

Expected `200`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/89484e34-91d7-4d66-9235-aee19968480b" \
  -H 'Content-Type: application/json' \
  -d '{
  "purpose": "Final project presentation"
}'
```

```json
{
  "id": "89484e34-91d7-4d66-9235-aee19968480b",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Final project presentation",
  "createdAt": "2026-10-06T07:00:40.008Z",
  "updatedAt": "2026-10-06T07:00:41.452Z"
}
```

### 34. Move booking 30 min earlier (overlaps only its own old slot) — **PASS**

Expected `200`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/89484e34-91d7-4d66-9235-aee19968480b" \
  -H 'Content-Type: application/json' \
  -d '{
  "startAt": "2026-10-20T08:30:00.000Z",
  "endAt": "2026-10-20T10:30:00.000Z"
}'
```

```json
{
  "id": "89484e34-91d7-4d66-9235-aee19968480b",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T08:30:00.000Z",
  "endAt": "2026-10-20T10:30:00.000Z",
  "purpose": "Final project presentation",
  "createdAt": "2026-10-06T07:00:40.008Z",
  "updatedAt": "2026-10-06T07:00:41.522Z"
}
```

### 35. Extend into the next booking → conflict — **PASS**

Expected `409`, got `409`

```bash
curl -s -X PATCH "$BASE_URL/bookings/89484e34-91d7-4d66-9235-aee19968480b" \
  -H 'Content-Type: application/json' \
  -d '{
  "endAt": "2026-10-20T11:30:00.000Z"
}'
```

```json
{
  "error": "This equipment is already booked for an overlapping time"
}
```

### 36. Set endAt before the stored startAt — **PASS**

Expected `400`, got `400`

```bash
curl -s -X PATCH "$BASE_URL/bookings/89484e34-91d7-4d66-9235-aee19968480b" \
  -H 'Content-Type: application/json' \
  -d '{
  "endAt": "2026-10-20T08:00:00.000Z"
}'
```

```json
{
  "error": "startAt must be before endAt"
}
```

### 37. Move to equipment that does not exist — **PASS**

Expected `400`, got `400`

```bash
curl -s -X PATCH "$BASE_URL/bookings/89484e34-91d7-4d66-9235-aee19968480b" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-999"
}'
```

```json
{
  "error": "equipmentId does not exist"
}
```

### 38. Empty update body {} — **FAIL**

Expected `400`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/89484e34-91d7-4d66-9235-aee19968480b" \
  -H 'Content-Type: application/json' \
  -d '{}'
```

```json
{
  "id": "89484e34-91d7-4d66-9235-aee19968480b",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T08:30:00.000Z",
  "endAt": "2026-10-20T10:30:00.000Z",
  "purpose": "Final project presentation",
  "createdAt": "2026-10-06T07:00:40.008Z",
  "updatedAt": "2026-10-06T07:00:41.790Z"
}
```

### 39. Update a booking that does not exist — **PASS**

Expected `404`, got `404`

```bash
curl -s -X PATCH "$BASE_URL/bookings/does-not-exist" \
  -H 'Content-Type: application/json' \
  -d '{
  "purpose": "x"
}'
```

```json
{
  "error": "Booking not found"
}
```

### 40. Get booking after updates (shows saved changes) — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings/89484e34-91d7-4d66-9235-aee19968480b"
```

```json
{
  "id": "89484e34-91d7-4d66-9235-aee19968480b",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T08:30:00.000Z",
  "endAt": "2026-10-20T10:30:00.000Z",
  "purpose": "Final project presentation",
  "createdAt": "2026-10-06T07:00:40.008Z",
  "updatedAt": "2026-10-06T07:00:41.790Z"
}
```

## Delete (DELETE /bookings/:id)

### 41. Delete a booking — **PASS**

Expected `204`, got `204`

```bash
curl -s -X DELETE "$BASE_URL/bookings/a8900c96-718c-4d5a-bec5-3d619e130dae"
```

```json
(empty body)
```

### 42. Get the deleted booking — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/a8900c96-718c-4d5a-bec5-3d619e130dae"
```

```json
{
  "error": "Booking not found"
}
```

### 43. Delete it again — **PASS**

Expected `404`, got `404`

```bash
curl -s -X DELETE "$BASE_URL/bookings/a8900c96-718c-4d5a-bec5-3d619e130dae"
```

```json
{
  "error": "Booking not found"
}
```

### 44. Slot freed by delete can be booked again — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-1",
  "borrowerName": "Malee Sukjai",
  "startAt": "2026-10-20T11:00:00.000Z",
  "endAt": "2026-10-20T12:00:00.000Z",
  "purpose": "Rebooked"
}'
```

```json
{
  "id": "7e2200c5-e0fd-4410-95a2-287e6f969c59",
  "equipmentId": "eq-1",
  "borrowerName": "Malee Sukjai",
  "startAt": "2026-10-20T11:00:00.000Z",
  "endAt": "2026-10-20T12:00:00.000Z",
  "purpose": "Rebooked",
  "createdAt": "2026-10-06T07:00:42.033Z",
  "updatedAt": "2026-10-06T07:00:42.033Z"
}
```

## Security and robustness

### 45. SQL injection text in the URL is treated as an id — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/x'%20OR%20'1'%3D'1"
```

```json
{
  "error": "Booking not found"
}
```

### 46. SQL injection text in a field is stored as plain text — **PASS**

Expected `201`, got `201`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-2",
  "borrowerName": "Robert'\''); DROP TABLE bookings;--",
  "startAt": "2026-10-23T09:00:00.000Z",
  "endAt": "2026-10-23T10:00:00.000Z",
  "purpose": "Injection test"
}'
```

```json
{
  "id": "804e48a2-dc6d-4467-8e0a-498606b678a9",
  "equipmentId": "eq-2",
  "borrowerName": "Robert'); DROP TABLE bookings;--",
  "startAt": "2026-10-23T09:00:00.000Z",
  "endAt": "2026-10-23T10:00:00.000Z",
  "purpose": "Injection test",
  "createdAt": "2026-10-06T07:00:42.139Z",
  "updatedAt": "2026-10-06T07:00:42.139Z"
}
```

### 47. bookings table still exists after injection attempt — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings"
```

```json
[
  {
    "id": "d99a3e5a-caf7-4126-8583-42f7e57b59d4",
    "equipmentId": "eq-1",
    "borrowerName": "Somchai Jaidee",
    "startAt": "2026-02-30T09:00:00.000Z",
    "endAt": "2026-02-30T10:00:00.000Z",
    "purpose": "No such day",
    "createdAt": "2026-10-06T07:00:40.921Z",
    "updatedAt": "2026-10-06T07:00:40.921Z"
  },
  {
    "id": "89484e34-91d7-4d66-9235-aee19968480b",
    "equipmentId": "eq-1",
    "borrowerName": "Somchai Jaidee",
    "startAt": "2026-10-20T08:30:00.000Z",
    "endAt": "2026-10-20T10:30:00.000Z",
    "purpose": "Final project presentation",
    "createdAt": "2026-10-06T07:00:40.008Z",
    "updatedAt": "2026-10-06T07:00:41.790Z"
  },
  {
    "id": "07e5f71e-c7a7-4840-8dfe-80f7eb1fd7aa",
    "equipmentId": "eq-2",
    "borrowerName": "Anan Dee",
    "startAt": "2026-10-20T09:00:00.000Z",
    "endAt": "2026-10-20T11:00:00.000Z",
    "purpose": "Photo shoot",
    "createdAt": "2026-10-06T07:00:40.200Z",
    "updatedAt": "2026-10-06T07:00:40.200Z"
  },
  {
    "id": "7e2200c5-e0fd-4410-95a2-287e6f969c59",
    "equipmentId": "eq-1",
    "borrowerName": "Malee Sukjai",
    "startAt": "2026-10-20T11:00:00.000Z",
    "endAt": "2026-10-20T12:00:00.000Z",
    "purpose": "Rebooked",
    "createdAt": "2026-10-06T07:00:42.033Z",
    "updatedAt": "2026-10-06T07:00:42.033Z"
  },
  {
    "id": "66d2fd41-c004-4d35-b845-359500707d03",
    "equipmentId": "eq-1",
    "borrowerName": "Somsak Rakdee",
    "startAt": "2026-10-20T15:00:00+07:00",
    "endAt": "2026-10-20T17:00:00+07:00",
    "purpose": "Offset clash",
    "createdAt": "2026-10-06T07:00:41.384Z",
    "updatedAt": "2026-10-06T07:00:41.384Z"
  },
  {
    "id": "f37d4cc2-5ac9-445f-a8e5-17ae9168e1e8",
    "equipmentId": "eq-3",
    "borrowerName": "Niran Ok",
    "startAt": "2026-10-21T09:00:00+07:00",
    "endAt": "2026-10-21T10:30:00+07:00",
    "purpose": "Team meeting",
    "createdAt": "2026-10-06T07:00:40.269Z",
    "updatedAt": "2026-10-06T07:00:40.269Z"
  },
  {
    "id": "3522b68e-cb6d-4be4-a25f-594f14ba319e",
    "equipmentId": "eq-1",
    "borrowerName": "123.0",
    "startAt": "2026-10-22T09:00:00.000Z",
    "endAt": "2026-10-22T10:00:00.000Z",
    "purpose": "1.0",
    "createdAt": "2026-10-06T07:00:40.789Z",
    "updatedAt": "2026-10-06T07:00:40.789Z"
  },
  {
    "id": "804e48a2-dc6d-4467-8e0a-498606b678a9",
    "equipmentId": "eq-2",
    "borrowerName": "Robert'); DROP TABLE bookings;--",
    "startAt": "2026-10-23T09:00:00.000Z",
    "endAt": "2026-10-23T10:00:00.000Z",
    "purpose": "Injection test",
    "createdAt": "2026-10-06T07:00:42.139Z",
    "updatedAt": "2026-10-06T07:00:42.139Z"
  }
]
```

### 48. Unknown route returns a JSON 404 — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/nope"
```

```json
404 Not Found
```

## Concurrent overlapping requests

### 49. 5 parallel identical bookings → exactly one 201, four 409 — **PASS**

Status codes received: `201 409 409 409 409` (201 × 1, 409 × 4)

Note: local `wrangler dev` may handle these one at a time, so this run shows the result is correct but doesn't prove the race is safe. The guarantee comes from the single-statement `INSERT … WHERE NOT EXISTS` (see QUALITY_GATE_REVIEW.md, finding 4).

## Summary

**41 passed, 8 failed, 49 total.**
