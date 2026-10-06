# Test Evidence

- **Base API URL:** `http://localhost:8787/api`
- **Run at:** 2026-10-06T07:00:36Z
- **Result:** 49 passed, 0 failed, 49 total
- **How:** `npm run test:curl` ([tests/curl-tests.sh](tests/curl-tests.sh)) runs each request with `curl`, records the real response, and compares the status code with the expected one. The bookings table is emptied through the API before the run.

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
  "id": "bde52e68-24e2-4a29-850f-10cf38cc7d4e",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation",
  "createdAt": "2026-10-06T07:00:36.715Z",
  "updatedAt": "2026-10-06T07:00:36.715Z"
}
```

### 4. Guide 4: Get one booking — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings/bde52e68-24e2-4a29-850f-10cf38cc7d4e"
```

```json
{
  "id": "bde52e68-24e2-4a29-850f-10cf38cc7d4e",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation",
  "createdAt": "2026-10-06T07:00:36.715Z",
  "updatedAt": "2026-10-06T07:00:36.715Z"
}
```

### 5. Guide 5: Update a booking (moved to 12:00–14:00Z) — **PASS**

Expected `200`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/bde52e68-24e2-4a29-850f-10cf38cc7d4e" \
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
  "id": "bde52e68-24e2-4a29-850f-10cf38cc7d4e",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T12:00:00.000Z",
  "endAt": "2026-10-20T14:00:00.000Z",
  "purpose": "Updated class presentation",
  "createdAt": "2026-10-06T07:00:36.715Z",
  "updatedAt": "2026-10-06T07:00:36.863Z"
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
  "error": "Equipment eq-1 is already booked for an overlapping time"
}
```

### 8. Guide 8: Missing booking — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/not-found"
```

```json
{
  "error": "Booking not found: not-found"
}
```

### 9. Guide 9: Delete a booking — **PASS**

Expected `204`, got `204`

```bash
curl -s -X DELETE "$BASE_URL/bookings/bde52e68-24e2-4a29-850f-10cf38cc7d4e"
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
  "id": "cb31034c-55d8-42d4-91b5-fcff113558e5",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation",
  "createdAt": "2026-10-06T07:00:37.146Z",
  "updatedAt": "2026-10-06T07:00:37.146Z"
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
  "id": "e3d3f46e-1117-4281-ba05-c5822e8668cd",
  "equipmentId": "eq-1",
  "borrowerName": "Malee Sukjai",
  "startAt": "2026-10-20T11:00:00.000Z",
  "endAt": "2026-10-20T12:00:00.000Z",
  "purpose": "Seminar",
  "createdAt": "2026-10-06T07:00:37.242Z",
  "updatedAt": "2026-10-06T07:00:37.242Z"
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
  "id": "3ffd3b74-e2b6-4076-974d-d8623dc9468e",
  "equipmentId": "eq-2",
  "borrowerName": "Anan Dee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Photo shoot",
  "createdAt": "2026-10-06T07:00:37.338Z",
  "updatedAt": "2026-10-06T07:00:37.338Z"
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
  "id": "0da6a2f9-040b-473b-b561-438026f26289",
  "equipmentId": "eq-3",
  "borrowerName": "Niran Ok",
  "startAt": "2026-10-21T02:00:00.000Z",
  "endAt": "2026-10-21T03:30:00.000Z",
  "purpose": "Team meeting",
  "createdAt": "2026-10-06T07:00:37.404Z",
  "updatedAt": "2026-10-06T07:00:37.404Z"
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
    "id": "3ffd3b74-e2b6-4076-974d-d8623dc9468e",
    "equipmentId": "eq-2",
    "borrowerName": "Anan Dee",
    "startAt": "2026-10-20T09:00:00.000Z",
    "endAt": "2026-10-20T11:00:00.000Z",
    "purpose": "Photo shoot",
    "createdAt": "2026-10-06T07:00:37.338Z",
    "updatedAt": "2026-10-06T07:00:37.338Z"
  },
  {
    "id": "cb31034c-55d8-42d4-91b5-fcff113558e5",
    "equipmentId": "eq-1",
    "borrowerName": "Somchai Jaidee",
    "startAt": "2026-10-20T09:00:00.000Z",
    "endAt": "2026-10-20T11:00:00.000Z",
    "purpose": "Class presentation",
    "createdAt": "2026-10-06T07:00:37.146Z",
    "updatedAt": "2026-10-06T07:00:37.146Z"
  },
  {
    "id": "e3d3f46e-1117-4281-ba05-c5822e8668cd",
    "equipmentId": "eq-1",
    "borrowerName": "Malee Sukjai",
    "startAt": "2026-10-20T11:00:00.000Z",
    "endAt": "2026-10-20T12:00:00.000Z",
    "purpose": "Seminar",
    "createdAt": "2026-10-06T07:00:37.242Z",
    "updatedAt": "2026-10-06T07:00:37.242Z"
  },
  {
    "id": "0da6a2f9-040b-473b-b561-438026f26289",
    "equipmentId": "eq-3",
    "borrowerName": "Niran Ok",
    "startAt": "2026-10-21T02:00:00.000Z",
    "endAt": "2026-10-21T03:30:00.000Z",
    "purpose": "Team meeting",
    "createdAt": "2026-10-06T07:00:37.404Z",
    "updatedAt": "2026-10-06T07:00:37.404Z"
  }
]
```

### 16. Get one booking by id — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings/cb31034c-55d8-42d4-91b5-fcff113558e5"
```

```json
{
  "id": "cb31034c-55d8-42d4-91b5-fcff113558e5",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation",
  "createdAt": "2026-10-06T07:00:37.146Z",
  "updatedAt": "2026-10-06T07:00:37.146Z"
}
```

### 17. Get a booking that does not exist — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/does-not-exist"
```

```json
{
  "error": "Booking not found: does-not-exist"
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
  "error": "Missing required field(s): startAt, endAt, purpose"
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
  "error": "equipmentId does not exist: eq-999"
}
```

### 22. Malformed JSON body — **PASS**

Expected `400`, got `400`

```bash
curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -d '{"equipmentId": "eq-1",'
```

```json
{
  "error": "Request body must be valid JSON"
}
```

### 23. Wrong types (number / boolean) — **PASS**

Expected `400`, got `400`

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
  "error": "borrowerName must be a string"
}
```

### 24. Blank borrowerName — **PASS**

Expected `400`, got `400`

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
  "error": "borrowerName must not be empty"
}
```

### 25. Impossible date 2026-02-30 — **PASS**

Expected `400`, got `400`

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
  "error": "startAt is not a real date/time: 2026-02-30T09:00:00.000Z"
}
```

### 26. Date-time without timezone — **PASS**

Expected `400`, got `400`

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
  "error": "startAt must be an ISO 8601 date-time with a timezone, e.g. 2026-10-20T09:00:00.000Z"
}
```

### 27. Unknown field (typo startTime) — **PASS**

Expected `400`, got `400`

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
  "error": "Unknown field(s): startTime. Allowed: equipmentId, borrowerName, startAt, endAt, purpose"
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
  "error": "Request body must be a JSON object"
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
  "error": "Equipment eq-1 is already booked for an overlapping time"
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
  "error": "Equipment eq-1 is already booked for an overlapping time"
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
  "error": "Equipment eq-1 is already booked for an overlapping time"
}
```

### 32. Overlap written as +07:00 (15:00+07:00 = 08:00Z, overlaps 09:00Z) — **PASS**

Expected `409`, got `409`

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
  "error": "Equipment eq-1 is already booked for an overlapping time"
}
```

## Update (PATCH /bookings/:id)

### 33. Update purpose only — **PASS**

Expected `200`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/cb31034c-55d8-42d4-91b5-fcff113558e5" \
  -H 'Content-Type: application/json' \
  -d '{
  "purpose": "Final project presentation"
}'
```

```json
{
  "id": "cb31034c-55d8-42d4-91b5-fcff113558e5",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Final project presentation",
  "createdAt": "2026-10-06T07:00:37.146Z",
  "updatedAt": "2026-10-06T07:00:38.589Z"
}
```

### 34. Move booking 30 min earlier (overlaps only its own old slot) — **PASS**

Expected `200`, got `200`

```bash
curl -s -X PATCH "$BASE_URL/bookings/cb31034c-55d8-42d4-91b5-fcff113558e5" \
  -H 'Content-Type: application/json' \
  -d '{
  "startAt": "2026-10-20T08:30:00.000Z",
  "endAt": "2026-10-20T10:30:00.000Z"
}'
```

```json
{
  "id": "cb31034c-55d8-42d4-91b5-fcff113558e5",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T08:30:00.000Z",
  "endAt": "2026-10-20T10:30:00.000Z",
  "purpose": "Final project presentation",
  "createdAt": "2026-10-06T07:00:37.146Z",
  "updatedAt": "2026-10-06T07:00:38.655Z"
}
```

### 35. Extend into the next booking → conflict — **PASS**

Expected `409`, got `409`

```bash
curl -s -X PATCH "$BASE_URL/bookings/cb31034c-55d8-42d4-91b5-fcff113558e5" \
  -H 'Content-Type: application/json' \
  -d '{
  "endAt": "2026-10-20T11:30:00.000Z"
}'
```

```json
{
  "error": "Equipment eq-1 is already booked for an overlapping time"
}
```

### 36. Set endAt before the stored startAt — **PASS**

Expected `400`, got `400`

```bash
curl -s -X PATCH "$BASE_URL/bookings/cb31034c-55d8-42d4-91b5-fcff113558e5" \
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
curl -s -X PATCH "$BASE_URL/bookings/cb31034c-55d8-42d4-91b5-fcff113558e5" \
  -H 'Content-Type: application/json' \
  -d '{
  "equipmentId": "eq-999"
}'
```

```json
{
  "error": "equipmentId does not exist: eq-999"
}
```

### 38. Empty update body {} — **PASS**

Expected `400`, got `400`

```bash
curl -s -X PATCH "$BASE_URL/bookings/cb31034c-55d8-42d4-91b5-fcff113558e5" \
  -H 'Content-Type: application/json' \
  -d '{}'
```

```json
{
  "error": "Provide at least one field to update: equipmentId, borrowerName, startAt, endAt, purpose"
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
  "error": "Booking not found: does-not-exist"
}
```

### 40. Get booking after updates (shows saved changes) — **PASS**

Expected `200`, got `200`

```bash
curl -s -X GET "$BASE_URL/bookings/cb31034c-55d8-42d4-91b5-fcff113558e5"
```

```json
{
  "id": "cb31034c-55d8-42d4-91b5-fcff113558e5",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T08:30:00.000Z",
  "endAt": "2026-10-20T10:30:00.000Z",
  "purpose": "Final project presentation",
  "createdAt": "2026-10-06T07:00:37.146Z",
  "updatedAt": "2026-10-06T07:00:38.655Z"
}
```

## Delete (DELETE /bookings/:id)

### 41. Delete a booking — **PASS**

Expected `204`, got `204`

```bash
curl -s -X DELETE "$BASE_URL/bookings/e3d3f46e-1117-4281-ba05-c5822e8668cd"
```

```json
(empty body)
```

### 42. Get the deleted booking — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/bookings/e3d3f46e-1117-4281-ba05-c5822e8668cd"
```

```json
{
  "error": "Booking not found: e3d3f46e-1117-4281-ba05-c5822e8668cd"
}
```

### 43. Delete it again — **PASS**

Expected `404`, got `404`

```bash
curl -s -X DELETE "$BASE_URL/bookings/e3d3f46e-1117-4281-ba05-c5822e8668cd"
```

```json
{
  "error": "Booking not found: e3d3f46e-1117-4281-ba05-c5822e8668cd"
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
  "id": "1749e848-8296-4ca3-9e3c-001c6f94a11f",
  "equipmentId": "eq-1",
  "borrowerName": "Malee Sukjai",
  "startAt": "2026-10-20T11:00:00.000Z",
  "endAt": "2026-10-20T12:00:00.000Z",
  "purpose": "Rebooked",
  "createdAt": "2026-10-06T07:00:39.170Z",
  "updatedAt": "2026-10-06T07:00:39.170Z"
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
  "error": "Booking not found: x' OR '1'='1"
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
  "id": "17f93f5d-9fd4-4e9c-b761-50e328ee9492",
  "equipmentId": "eq-2",
  "borrowerName": "Robert'); DROP TABLE bookings;--",
  "startAt": "2026-10-23T09:00:00.000Z",
  "endAt": "2026-10-23T10:00:00.000Z",
  "purpose": "Injection test",
  "createdAt": "2026-10-06T07:00:39.272Z",
  "updatedAt": "2026-10-06T07:00:39.272Z"
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
    "id": "cb31034c-55d8-42d4-91b5-fcff113558e5",
    "equipmentId": "eq-1",
    "borrowerName": "Somchai Jaidee",
    "startAt": "2026-10-20T08:30:00.000Z",
    "endAt": "2026-10-20T10:30:00.000Z",
    "purpose": "Final project presentation",
    "createdAt": "2026-10-06T07:00:37.146Z",
    "updatedAt": "2026-10-06T07:00:38.655Z"
  },
  {
    "id": "3ffd3b74-e2b6-4076-974d-d8623dc9468e",
    "equipmentId": "eq-2",
    "borrowerName": "Anan Dee",
    "startAt": "2026-10-20T09:00:00.000Z",
    "endAt": "2026-10-20T11:00:00.000Z",
    "purpose": "Photo shoot",
    "createdAt": "2026-10-06T07:00:37.338Z",
    "updatedAt": "2026-10-06T07:00:37.338Z"
  },
  {
    "id": "1749e848-8296-4ca3-9e3c-001c6f94a11f",
    "equipmentId": "eq-1",
    "borrowerName": "Malee Sukjai",
    "startAt": "2026-10-20T11:00:00.000Z",
    "endAt": "2026-10-20T12:00:00.000Z",
    "purpose": "Rebooked",
    "createdAt": "2026-10-06T07:00:39.170Z",
    "updatedAt": "2026-10-06T07:00:39.170Z"
  },
  {
    "id": "0da6a2f9-040b-473b-b561-438026f26289",
    "equipmentId": "eq-3",
    "borrowerName": "Niran Ok",
    "startAt": "2026-10-21T02:00:00.000Z",
    "endAt": "2026-10-21T03:30:00.000Z",
    "purpose": "Team meeting",
    "createdAt": "2026-10-06T07:00:37.404Z",
    "updatedAt": "2026-10-06T07:00:37.404Z"
  },
  {
    "id": "17f93f5d-9fd4-4e9c-b761-50e328ee9492",
    "equipmentId": "eq-2",
    "borrowerName": "Robert'); DROP TABLE bookings;--",
    "startAt": "2026-10-23T09:00:00.000Z",
    "endAt": "2026-10-23T10:00:00.000Z",
    "purpose": "Injection test",
    "createdAt": "2026-10-06T07:00:39.272Z",
    "updatedAt": "2026-10-06T07:00:39.272Z"
  }
]
```

### 48. Unknown route returns a JSON 404 — **PASS**

Expected `404`, got `404`

```bash
curl -s -X GET "$BASE_URL/nope"
```

```json
{
  "error": "Route not found: GET /api/nope"
}
```

## Concurrent overlapping requests

### 49. 5 parallel identical bookings → exactly one 201, four 409 — **PASS**

Status codes received: `201 409 409 409 409` (201 × 1, 409 × 4)

Note: local `wrangler dev` may handle these one at a time, so this run shows the result is correct but doesn't prove the race is safe. The guarantee comes from the single-statement `INSERT … WHERE NOT EXISTS` (see QUALITY_GATE_REVIEW.md, finding 4).

## Summary

**49 passed, 0 failed, 49 total.**
