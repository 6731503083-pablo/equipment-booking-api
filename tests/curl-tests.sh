#!/usr/bin/env bash
# Runs every test case with curl against a running API and writes the evidence to
# TEST_EVIDENCE.md. Usage:  npm run dev   (other terminal)  then  npm run test:curl
# Override the target with BASE_URL=https://... npm run test:curl
set -u
BASE_URL="${BASE_URL:-http://localhost:8787/api}"
OUT="${OUT:-TEST_EVIDENCE.md}"
PASS=0; FAIL=0; N=0
LAST_BODY=""

# Pretty-print JSON with 2-space indent. Input that isn't valid JSON (e.g. the malformed-body test) is printed unchanged.
pretty() { node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.stringify(JSON.parse(s),null,2))}catch{process.stdout.write(s.endsWith("\n")?s:s+"\n")}})'; }

json_field() { node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const v=JSON.parse(s)[process.argv[1]];console.log(v??"")}catch{console.log("")}})' "$1"; }

# run "<title>" <expected status> <METHOD> <path> [json body]
run() {
  local title="$1" expected="$2" method="$3" path="$4" body="${5-}"
  N=$((N + 1))
  local args=(-s -X "$method" "$BASE_URL$path" -w $'\n%{http_code}')
  local shown="curl -s -X $method \"\$BASE_URL$path\""
  if [ -n "$body" ]; then
    args+=(-H 'Content-Type: application/json' --data-raw "$body")
    # Shown as a multi-line, copy-pasteable command; a ' inside the body is escaped as '\''.
    local shown_body
    shown_body=$(printf '%s' "$body" | pretty | sed "s/'/'\\\\''/g")
    shown+=$' \\\n  -H \'Content-Type: application/json\' \\\n  -d \''"$shown_body"\'
  fi
  local raw status
  raw=$(curl "${args[@]}")
  status="${raw##*$'\n'}"
  LAST_BODY="${raw%$'\n'*}"
  local verdict="PASS"
  if [ "$status" = "$expected" ]; then PASS=$((PASS + 1)); else verdict="FAIL"; FAIL=$((FAIL + 1)); fi
  printf '%-4s %2d. %-62s expected %s got %s\n' "$verdict" "$N" "$title" "$expected" "$status"
  {
    echo "### $N. $title — **$verdict**"
    echo
    echo "Expected \`$expected\`, got \`$status\`"
    echo
    echo '```bash'
    echo "$shown"
    echo '```'
    echo
    echo '```json'
    if [ -n "$LAST_BODY" ]; then printf '%s' "$LAST_BODY" | pretty; else echo "(empty body)"; fi
    echo '```'
    echo
  } >> "$OUT"
}

section() { printf '\n== %s\n' "$1"; printf '## %s\n\n' "$1" >> "$OUT"; }

# Start from an empty bookings table so the run is repeatable.
for id in $(curl -s "$BASE_URL/bookings" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>JSON.parse(s).forEach(b=>console.log(b.id)))'); do
  curl -s -o /dev/null -X DELETE "$BASE_URL/bookings/$id"
done

cat > "$OUT" <<EOF
# Test Evidence

- **Base API URL:** \`$BASE_URL\`
- **Run at:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
- **How:** \`npm run test:curl\` ([tests/curl-tests.sh](tests/curl-tests.sh)) runs each request with \`curl\`, records the real response, and compares the status code with the expected one. The bookings table is emptied through the API before the run.

EOF

BOOKING='{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}'

section "Read equipment"
run "List equipment" 200 GET /equipment

section "Create (POST /bookings)"
run "Create a valid booking (eq-1, 09:00–11:00Z)" 201 POST /bookings "$BOOKING"
ID1=$(echo "$LAST_BODY" | json_field id)
run "Back-to-back booking 11:00–12:00Z on eq-1 is allowed" 201 POST /bookings '{"equipmentId":"eq-1","borrowerName":"Malee Sukjai","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Seminar"}'
ID2=$(echo "$LAST_BODY" | json_field id)
run "Same time on different equipment (eq-2) is allowed" 201 POST /bookings '{"equipmentId":"eq-2","borrowerName":"Anan Dee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Photo shoot"}'
run "Time given with +07:00 offset is stored in UTC" 201 POST /bookings '{"equipmentId":"eq-3","borrowerName":"Niran Ok","startAt":"2026-10-21T09:00:00+07:00","endAt":"2026-10-21T10:30:00+07:00","purpose":"Team meeting"}'

section "Read bookings"
run "List bookings" 200 GET /bookings
run "Get one booking by id" 200 GET "/bookings/$ID1"
run "Get a booking that does not exist" 404 GET /bookings/does-not-exist

section "Validation errors (400)"
run "Missing required fields" 400 POST /bookings '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee"}'
run "startAt after endAt" 400 POST /bookings '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-22T11:00:00.000Z","endAt":"2026-10-22T09:00:00.000Z","purpose":"Backwards"}'
run "startAt equal to endAt (zero length)" 400 POST /bookings '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T09:00:00.000Z","purpose":"Zero length"}'
run "equipmentId that does not exist" 400 POST /bookings '{"equipmentId":"eq-999","borrowerName":"Somchai Jaidee","startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T10:00:00.000Z","purpose":"Ghost equipment"}'
run "Malformed JSON body" 400 POST /bookings '{"equipmentId": "eq-1",'
run "Wrong types (number / boolean)" 400 POST /bookings '{"equipmentId":"eq-1","borrowerName":123,"startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T10:00:00.000Z","purpose":true}'
run "Blank borrowerName" 400 POST /bookings '{"equipmentId":"eq-1","borrowerName":"   ","startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T10:00:00.000Z","purpose":"Blank name"}'
run "Impossible date 2026-02-30" 400 POST /bookings '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-02-30T09:00:00.000Z","endAt":"2026-02-30T10:00:00.000Z","purpose":"No such day"}'
run "Date-time without timezone" 400 POST /bookings '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-22T09:00:00","endAt":"2026-10-22T10:00:00","purpose":"Ambiguous"}'
run "Unknown field (typo startTime)" 400 POST /bookings '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startTime":"2026-10-22T09:00:00.000Z","startAt":"2026-10-22T09:00:00.000Z","endAt":"2026-10-22T10:00:00.000Z","purpose":"Typo"}'
run "Body is a JSON array, not an object" 400 POST /bookings '[1,2,3]'

section "Overlap conflicts (409)"
run "Overlapping booking on eq-1 (10:00–12:00Z)" 409 POST /bookings '{"equipmentId":"eq-1","borrowerName":"Somsak Rakdee","startAt":"2026-10-20T10:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Clash"}'
run "Booking fully inside an existing one (09:30–10:00Z)" 409 POST /bookings '{"equipmentId":"eq-1","borrowerName":"Somsak Rakdee","startAt":"2026-10-20T09:30:00.000Z","endAt":"2026-10-20T10:00:00.000Z","purpose":"Inside"}'
run "Booking that covers an existing one (08:00–13:00Z)" 409 POST /bookings '{"equipmentId":"eq-1","borrowerName":"Somsak Rakdee","startAt":"2026-10-20T08:00:00.000Z","endAt":"2026-10-20T13:00:00.000Z","purpose":"Around"}'
run "Overlap written as +07:00 (15:00+07:00 = 08:00Z, overlaps 09:00Z)" 409 POST /bookings '{"equipmentId":"eq-1","borrowerName":"Somsak Rakdee","startAt":"2026-10-20T15:00:00+07:00","endAt":"2026-10-20T17:00:00+07:00","purpose":"Offset clash"}'

section "Update (PATCH /bookings/:id)"
run "Update purpose only" 200 PATCH "/bookings/$ID1" '{"purpose":"Final project presentation"}'
run "Move booking 30 min earlier (overlaps only its own old slot)" 200 PATCH "/bookings/$ID1" '{"startAt":"2026-10-20T08:30:00.000Z","endAt":"2026-10-20T10:30:00.000Z"}'
run "Extend into the next booking → conflict" 409 PATCH "/bookings/$ID1" '{"endAt":"2026-10-20T11:30:00.000Z"}'
run "Set endAt before the stored startAt" 400 PATCH "/bookings/$ID1" '{"endAt":"2026-10-20T08:00:00.000Z"}'
run "Move to equipment that does not exist" 400 PATCH "/bookings/$ID1" '{"equipmentId":"eq-999"}'
run "Empty update body {}" 400 PATCH "/bookings/$ID1" '{}'
run "Update a booking that does not exist" 404 PATCH /bookings/does-not-exist '{"purpose":"x"}'
run "Get booking after updates (shows saved changes)" 200 GET "/bookings/$ID1"

section "Delete (DELETE /bookings/:id)"
run "Delete a booking" 204 DELETE "/bookings/$ID2"
run "Get the deleted booking" 404 GET "/bookings/$ID2"
run "Delete it again" 404 DELETE "/bookings/$ID2"
run "Slot freed by delete can be booked again" 201 POST /bookings '{"equipmentId":"eq-1","borrowerName":"Malee Sukjai","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Rebooked"}'

section "Security and robustness"
run "SQL injection text in the URL is treated as an id" 404 GET "/bookings/x'%20OR%20'1'%3D'1"
run "SQL injection text in a field is stored as plain text" 201 POST /bookings "{\"equipmentId\":\"eq-2\",\"borrowerName\":\"Robert'); DROP TABLE bookings;--\",\"startAt\":\"2026-10-23T09:00:00.000Z\",\"endAt\":\"2026-10-23T10:00:00.000Z\",\"purpose\":\"Injection test\"}"
run "bookings table still exists after injection attempt" 200 GET /bookings
run "Unknown route returns a JSON 404" 404 GET /nope

# Five identical overlapping requests at the same moment: exactly one may win.
section "Concurrent overlapping requests"
RACE='{"equipmentId":"eq-3","borrowerName":"Racer","startAt":"2026-10-24T09:00:00.000Z","endAt":"2026-10-24T10:00:00.000Z","purpose":"Race"}'
CODES=$(for i in 1 2 3 4 5; do curl -s -o /dev/null -w '%{http_code}\n' -X POST "$BASE_URL/bookings" -H 'Content-Type: application/json' --data-raw "$RACE" & done; wait)
WINS=$(echo "$CODES" | grep -c '^201$'); CONFLICTS=$(echo "$CODES" | grep -c '^409$')
N=$((N + 1)); verdict="PASS"
if [ "$WINS" = 1 ] && [ "$CONFLICTS" = 4 ]; then PASS=$((PASS + 1)); else verdict="FAIL"; FAIL=$((FAIL + 1)); fi
printf '%-4s %2d. %-62s 201=%s 409=%s\n' "$verdict" "$N" "5 parallel identical bookings → one 201, four 409" "$WINS" "$CONFLICTS"
{
  echo "### $N. 5 parallel identical bookings → exactly one 201, four 409 — **$verdict**"
  echo
  echo "Status codes received: \`$(echo $CODES)\` (201 × $WINS, 409 × $CONFLICTS)"
  echo
  echo "Note: local \`wrangler dev\` may handle these one at a time, so this run shows the result is correct but doesn't prove the race is safe. The guarantee comes from the single-statement \`INSERT … WHERE NOT EXISTS\` (see QUALITY_GATE_REVIEW.md, finding 4)."
  echo
} >> "$OUT"

{
  echo "## Summary"
  echo
  echo "**$PASS passed, $FAIL failed, $N total.**"
} >> "$OUT"
# Put the summary at the top as well.
sed -i.bak "s|^- \*\*How:\*\*|- **Result:** $PASS passed, $FAIL failed, $N total\\
- **How:**|" "$OUT" && rm -f "$OUT.bak"

printf '\n%d passed, %d failed, %d total → %s\n' "$PASS" "$FAIL" "$N" "$OUT"
[ "$FAIL" -eq 0 ]
