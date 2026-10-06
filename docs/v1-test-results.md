# Test Evidence — v1 snapshot (before the Quality Gate fixes)

- **Base API URL:** `http://localhost:8788/api` (the **v1 snapshot** code, run on a second port so it could be compared with v2)
- **Run at:** 2026-10-06T06:48:32Z
- **Result:** 32 passed, 8 failed, 40 total
- **How:** `npm run test:curl` ([tests/curl-tests.sh](../tests/curl-tests.sh)) runs each request with `curl`, records the real response, and compares the status code with the expected one. The bookings table is emptied through the API before the run.

## Read equipment

### 1. List equipment — **PASS**

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

### 2. Create a valid booking (eq-1, 09:00–11:00Z) — **PASS**

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
  "id": "f379a30a-f390-4d3e-8ff6-bf6111126105",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation",
  "createdAt": "2026-10-06T06:48:32.723Z",
  "updatedAt": "2026-10-06T06:48:32.723Z"
}
```

### 3. Back-to-back booking 11:00–12:00Z on eq-1 is allowed — **PASS**

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
  "id": "a9d0ecab-96d7-4ef9-9903-b365a04edc3c",
  "equipmentId": "eq-1",
  "borrowerName": "Malee Sukjai",
  "startAt": "2026-10-20T11:00:00.000Z",
  "endAt": "2026-10-20T12:00:00.000Z",
  "purpose": "Seminar",
  "createdAt": "2026-10-06T06:48:32.820Z",
  "updatedAt": "2026-10-06T06:48:32.820Z"
}
```

### 4. Same time on different equipment (eq-2) is allowed — **PASS**

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
  "id": "47cd2759-1d78-40ca-8ce7-2595ec021ca5",
  "equipmentId": "eq-2",
  "borrowerName": "Anan Dee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Photo shoot",
  "createdAt": "2026-10-06T06:48:32.918Z",
  "updatedAt": "2026-10-06T06:48:32.918Z"
}
```

### 5. Time given with +07:00 offset is stored in UTC — **PASS**

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
  "id": "90dba334-7a9b-4ebe-855b-06afd2284edf",
  "equipmentId": "eq-3",
  "borrowerName": "Niran Ok",
  "startAt": "2026-10-21T09:00:00+07:00",
  "endAt": "2026-10-21T10:30:00+07:00",
  "purpose": "Team meeting",
  "createdAt": "2026-10-06T06:48:32.986Z",
  "updatedAt": "2026-10-06T06:48:32.986Z"
}
```

## Read bookings

### 6. List bookings — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings"
```

```json
[
  {
    "id": "f379a30a-f390-4d3e-8ff6-bf6111126105",
    "equipmentId": "eq-1",
    "borrowerName": "Somchai Jaidee",
    "startAt": "2026-10-20T09:00:00.000Z",
    "endAt": "2026-10-20T11:00:00.000Z",
    "purpose": "Class presentation",
    "createdAt": "2026-10-06T06:48:32.723Z",
    "updatedAt": "2026-10-06T06:48:32.723Z"
  },
  {
    "id": "47cd2759-1d78-40ca-8ce7-2595ec021ca5",
    "equipmentId": "eq-2",
    "borrowerName": "Anan Dee",
    "startAt": "2026-10-20T09:00:00.000Z",
    "endAt": "2026-10-20T11:00:00.000Z",
    "purpose": "Photo shoot",
    "createdAt": "2026-10-06T06:48:32.918Z",
    "updatedAt": "2026-10-06T06:48:32.918Z"
  },
  {
    "id": "a9d0ecab-96d7-4ef9-9903-b365a04edc3c",
    "equipmentId": "eq-1",
    "borrowerName": "Malee Sukjai",
    "startAt": "2026-10-20T11:00:00.000Z",
    "endAt": "2026-10-20T12:00:00.000Z",
    "purpose": "Seminar",
    "createdAt": "2026-10-06T06:48:32.820Z",
    "updatedAt": "2026-10-06T06:48:32.820Z"
  },
  {
    "id": "90dba334-7a9b-4ebe-855b-06afd2284edf",
    "equipmentId": "eq-3",
    "borrowerName": "Niran Ok",
    "startAt": "2026-10-21T09:00:00+07:00",
    "endAt": "2026-10-21T10:30:00+07:00",
    "purpose": "Team meeting",
    "createdAt": "2026-10-06T06:48:32.986Z",
    "updatedAt": "2026-10-06T06:48:32.986Z"
  }
]
```

### 7. Get one booking by id — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings/f379a30a-f390-4d3e-8ff6-bf6111126105"
```

```json
{
  "id": "f379a30a-f390-4d3e-8ff6-bf6111126105",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation",
  "createdAt": "2026-10-06T06:48:32.723Z",
  "updatedAt": "2026-10-06T06:48:32.723Z"
}
```

### 8. Get a booking that does not exist — **PASS**

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

### 9. Missing required fields — **PASS**

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

### 10. startAt after endAt — **PASS**

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

### 11. startAt equal to endAt (zero length) — **PASS**

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

### 12. equipmentId that does not exist — **PASS**

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

### 13. Malformed JSON body — **FAIL**

Expected `400`, got `500`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{"equipmentId": "eq-1",'
```

```json
Internal Server Error
```

### 14. Wrong types (number / boolean) — **FAIL**

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
  "id": "8a128a2e-903a-40d3-a49f-4399e108ff21",
  "equipmentId": "eq-1",
  "borrowerName": "123.0",
  "startAt": "2026-10-22T09:00:00.000Z",
  "endAt": "2026-10-22T10:00:00.000Z",
  "purpose": "1.0",
  "createdAt": "2026-10-06T06:48:33.496Z",
  "updatedAt": "2026-10-06T06:48:33.496Z"
}
```

### 15. Blank borrowerName — **FAIL**

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

### 16. Impossible date 2026-02-30 — **FAIL**

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
  "id": "3cdfe036-a4eb-4bf4-9c41-8078d401f4a8",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-02-30T09:00:00.000Z",
  "endAt": "2026-02-30T10:00:00.000Z",
  "purpose": "No such day",
  "createdAt": "2026-10-06T06:48:33.633Z",
  "updatedAt": "2026-10-06T06:48:33.633Z"
}
```

### 17. Date-time without timezone — **FAIL**

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

### 18. Unknown field (typo startTime) — **FAIL**

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

### 19. Body is a JSON array, not an object — **PASS**

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

### 20. Overlapping booking on eq-1 (10:00–12:00Z) — **PASS**

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

### 21. Booking fully inside an existing one (09:30–10:00Z) — **PASS**

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

### 22. Booking that covers an existing one (08:00–13:00Z) — **PASS**

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

### 23. Overlap written as +07:00 (15:00+07:00 = 08:00Z, overlaps 09:00Z) — **FAIL**

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
  "id": "406458dc-1fc2-43d1-850d-fd0413c253d7",
  "equipmentId": "eq-1",
  "borrowerName": "Somsak Rakdee",
  "startAt": "2026-10-20T15:00:00+07:00",
  "endAt": "2026-10-20T17:00:00+07:00",
  "purpose": "Offset clash",
  "createdAt": "2026-10-06T06:48:34.132Z",
  "updatedAt": "2026-10-06T06:48:34.132Z"
}
```

## Update (PATCH /bookings/:id)

### 24. Update purpose only — **PASS**

Expected `200`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/f379a30a-f390-4d3e-8ff6-bf6111126105" \
  -H 'Content-Type: application/json' \
  -d '{
  "purpose": "Final project presentation"
}'
```

```json
{
  "id": "f379a30a-f390-4d3e-8ff6-bf6111126105",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Final project presentation",
  "createdAt": "2026-10-06T06:48:32.723Z",
  "updatedAt": "2026-10-06T06:48:34.199Z"
}
```

### 25. Move booking 30 min earlier (overlaps only its own old slot) — **PASS**

Expected `200`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/f379a30a-f390-4d3e-8ff6-bf6111126105" \
  -H 'Content-Type: application/json' \
  -d '{
  "startAt": "2026-10-20T08:30:00.000Z",
  "endAt": "2026-10-20T10:30:00.000Z"
}'
```

```json
{
  "id": "f379a30a-f390-4d3e-8ff6-bf6111126105",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T08:30:00.000Z",
  "endAt": "2026-10-20T10:30:00.000Z",
  "purpose": "Final project presentation",
  "createdAt": "2026-10-06T06:48:32.723Z",
  "updatedAt": "2026-10-06T06:48:34.267Z"
}
```

### 26. Extend into the next booking → conflict — **PASS**

Expected `409`, got `409`

```bash
curl -s -X PATCH "$BASE_URL/bookings/f379a30a-f390-4d3e-8ff6-bf6111126105" \
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

### 27. Set endAt before the stored startAt — **PASS**

Expected `400`, got `400`

```bash
curl -s -X PATCH "$BASE_URL/bookings/f379a30a-f390-4d3e-8ff6-bf6111126105" \
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

### 28. Move to equipment that does not exist — **PASS**

Expected `400`, got `400`

```bash
curl -s -X PATCH "$BASE_URL/bookings/f379a30a-f390-4d3e-8ff6-bf6111126105" \
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

### 29. Empty update body {} — **FAIL**

Expected `400`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/f379a30a-f390-4d3e-8ff6-bf6111126105" \
  -H 'Content-Type: application/json' \
  -d '{}'
```

```json
{
  "id": "f379a30a-f390-4d3e-8ff6-bf6111126105",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T08:30:00.000Z",
  "endAt": "2026-10-20T10:30:00.000Z",
  "purpose": "Final project presentation",
  "createdAt": "2026-10-06T06:48:32.723Z",
  "updatedAt": "2026-10-06T06:48:34.532Z"
}
```

### 30. Update a booking that does not exist — **PASS**

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

### 31. Get booking after updates (shows saved changes) — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings/f379a30a-f390-4d3e-8ff6-bf6111126105"
```

```json
{
  "id": "f379a30a-f390-4d3e-8ff6-bf6111126105",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T08:30:00.000Z",
  "endAt": "2026-10-20T10:30:00.000Z",
  "purpose": "Final project presentation",
  "createdAt": "2026-10-06T06:48:32.723Z",
  "updatedAt": "2026-10-06T06:48:34.532Z"
}
```

## Delete (DELETE /bookings/:id)

### 32. Delete a booking — **PASS**

Expected `204`, got `204`

```bash
curl -s -X DELETE "$BASE_URL/bookings/a9d0ecab-96d7-4ef9-9903-b365a04edc3c"
```

```json
(empty body)
```

### 33. Get the deleted booking — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/a9d0ecab-96d7-4ef9-9903-b365a04edc3c"
```

```json
{
  "error": "Booking not found"
}
```

### 34. Delete it again — **PASS**

Expected `404`, got `404`

```bash
curl -s -X DELETE "$BASE_URL/bookings/a9d0ecab-96d7-4ef9-9903-b365a04edc3c"
```

```json
{
  "error": "Booking not found"
}
```

### 35. Slot freed by delete can be booked again — **PASS**

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
  "id": "30368d4c-629f-4c06-b3a8-b4e34acffb0c",
  "equipmentId": "eq-1",
  "borrowerName": "Malee Sukjai",
  "startAt": "2026-10-20T11:00:00.000Z",
  "endAt": "2026-10-20T12:00:00.000Z",
  "purpose": "Rebooked",
  "createdAt": "2026-10-06T06:48:34.780Z",
  "updatedAt": "2026-10-06T06:48:34.780Z"
}
```

## Security and robustness

### 36. SQL injection text in the URL is treated as an id — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/x'%20OR%20'1'%3D'1"
```

```json
{
  "error": "Booking not found"
}
```

### 37. SQL injection text in a field is stored as plain text — **PASS**

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
  "id": "8ac6792f-bd7e-440a-a05e-9fce4aafc00d",
  "equipmentId": "eq-2",
  "borrowerName": "Robert'); DROP TABLE bookings;--",
  "startAt": "2026-10-23T09:00:00.000Z",
  "endAt": "2026-10-23T10:00:00.000Z",
  "purpose": "Injection test",
  "createdAt": "2026-10-06T06:48:34.881Z",
  "updatedAt": "2026-10-06T06:48:34.881Z"
}
```

### 38. bookings table still exists after injection attempt — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings"
```

```json
[
  {
    "id": "3cdfe036-a4eb-4bf4-9c41-8078d401f4a8",
    "equipmentId": "eq-1",
    "borrowerName": "Somchai Jaidee",
    "startAt": "2026-02-30T09:00:00.000Z",
    "endAt": "2026-02-30T10:00:00.000Z",
    "purpose": "No such day",
    "createdAt": "2026-10-06T06:48:33.633Z",
    "updatedAt": "2026-10-06T06:48:33.633Z"
  },
  {
    "id": "f379a30a-f390-4d3e-8ff6-bf6111126105",
    "equipmentId": "eq-1",
    "borrowerName": "Somchai Jaidee",
    "startAt": "2026-10-20T08:30:00.000Z",
    "endAt": "2026-10-20T10:30:00.000Z",
    "purpose": "Final project presentation",
    "createdAt": "2026-10-06T06:48:32.723Z",
    "updatedAt": "2026-10-06T06:48:34.532Z"
  },
  {
    "id": "47cd2759-1d78-40ca-8ce7-2595ec021ca5",
    "equipmentId": "eq-2",
    "borrowerName": "Anan Dee",
    "startAt": "2026-10-20T09:00:00.000Z",
    "endAt": "2026-10-20T11:00:00.000Z",
    "purpose": "Photo shoot",
    "createdAt": "2026-10-06T06:48:32.918Z",
    "updatedAt": "2026-10-06T06:48:32.918Z"
  },
  {
    "id": "30368d4c-629f-4c06-b3a8-b4e34acffb0c",
    "equipmentId": "eq-1",
    "borrowerName": "Malee Sukjai",
    "startAt": "2026-10-20T11:00:00.000Z",
    "endAt": "2026-10-20T12:00:00.000Z",
    "purpose": "Rebooked",
    "createdAt": "2026-10-06T06:48:34.780Z",
    "updatedAt": "2026-10-06T06:48:34.780Z"
  },
  {
    "id": "406458dc-1fc2-43d1-850d-fd0413c253d7",
    "equipmentId": "eq-1",
    "borrowerName": "Somsak Rakdee",
    "startAt": "2026-10-20T15:00:00+07:00",
    "endAt": "2026-10-20T17:00:00+07:00",
    "purpose": "Offset clash",
    "createdAt": "2026-10-06T06:48:34.132Z",
    "updatedAt": "2026-10-06T06:48:34.132Z"
  },
  {
    "id": "90dba334-7a9b-4ebe-855b-06afd2284edf",
    "equipmentId": "eq-3",
    "borrowerName": "Niran Ok",
    "startAt": "2026-10-21T09:00:00+07:00",
    "endAt": "2026-10-21T10:30:00+07:00",
    "purpose": "Team meeting",
    "createdAt": "2026-10-06T06:48:32.986Z",
    "updatedAt": "2026-10-06T06:48:32.986Z"
  },
  {
    "id": "8a128a2e-903a-40d3-a49f-4399e108ff21",
    "equipmentId": "eq-1",
    "borrowerName": "123.0",
    "startAt": "2026-10-22T09:00:00.000Z",
    "endAt": "2026-10-22T10:00:00.000Z",
    "purpose": "1.0",
    "createdAt": "2026-10-06T06:48:33.496Z",
    "updatedAt": "2026-10-06T06:48:33.496Z"
  },
  {
    "id": "8ac6792f-bd7e-440a-a05e-9fce4aafc00d",
    "equipmentId": "eq-2",
    "borrowerName": "Robert'); DROP TABLE bookings;--",
    "startAt": "2026-10-23T09:00:00.000Z",
    "endAt": "2026-10-23T10:00:00.000Z",
    "purpose": "Injection test",
    "createdAt": "2026-10-06T06:48:34.881Z",
    "updatedAt": "2026-10-06T06:48:34.881Z"
  }
]
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
