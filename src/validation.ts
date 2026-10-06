// Request-body validation for bookings. Every function returns either the cleaned
// value or an error message; the route turns an error message into a 400.

export type BookingInput = {
  equipmentId: string;
  borrowerName: string;
  startAt: string; // normalised to UTC, e.g. 2026-10-20T09:00:00.000Z
  endAt: string;
  purpose: string;
};

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const FIELDS = ['equipmentId', 'borrowerName', 'startAt', 'endAt', 'purpose'] as const;
type Field = (typeof FIELDS)[number];

const MAX_LENGTH: Record<Field, number> = {
  equipmentId: 50,
  borrowerName: 100,
  startAt: 40,
  endAt: 40,
  purpose: 500,
};

// Full ISO 8601 date-time with an explicit timezone (Z or ±hh:mm). A time with no
// timezone is rejected: JavaScript would read it in the server's local zone, so the
// same request could mean different instants on different machines.
const ISO_DATETIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

// Returns the instant as a UTC string from toISOString(). Every stored time has
// this one fixed format, which is what makes the SQL text comparisons
// (start_at < ?) order times correctly. "+07:00" and "Z" inputs can't be compared as text.
function parseDateTime(field: Field, raw: string): Result<string> {
  const m = ISO_DATETIME.exec(raw);
  if (!m) {
    return { ok: false, error: `${field} must be an ISO 8601 date-time with a timezone, e.g. 2026-10-20T09:00:00.000Z` };
  }
  const [, y, mo, d, h, mi, s] = m.map(Number);
  // Date.parse silently rolls 2026-02-30 over to 2026-03-02, so check the calendar date ourselves.
  const calendar = new Date(Date.UTC(y, mo - 1, d));
  if (calendar.getUTCMonth() !== mo - 1 || calendar.getUTCDate() !== d || h > 23 || mi > 59 || (s || 0) > 59) {
    return { ok: false, error: `${field} is not a real date/time: ${raw}` };
  }
  const instant = new Date(raw);
  // Catches impossible offsets such as +99:00 (toISOString would throw on them).
  if (isNaN(instant.getTime())) return { ok: false, error: `${field} is not a real date/time: ${raw}` };
  return { ok: true, value: instant.toISOString() };
}

function checkField(field: Field, raw: unknown): Result<string> {
  if (typeof raw !== 'string') return { ok: false, error: `${field} must be a string` };
  const value = raw.trim();
  if (value === '') return { ok: false, error: `${field} must not be empty` };
  if (value.length > MAX_LENGTH[field]) {
    return { ok: false, error: `${field} must be at most ${MAX_LENGTH[field]} characters` };
  }
  if (field === 'startAt' || field === 'endAt') return parseDateTime(field, value);
  return { ok: true, value };
}

function asObject(body: unknown): Result<Record<string, unknown>> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const unknown = Object.keys(body).filter((k) => !(FIELDS as readonly string[]).includes(k));
  if (unknown.length > 0) {
    return { ok: false, error: `Unknown field(s): ${unknown.join(', ')}. Allowed: ${FIELDS.join(', ')}` };
  }
  return { ok: true, value: body as Record<string, unknown> };
}

function checkTimeOrder(input: BookingInput): Result<BookingInput> {
  if (input.startAt >= input.endAt) return { ok: false, error: 'startAt must be before endAt' };
  return { ok: true, value: input };
}

// POST: all five fields are required.
export function validateCreate(body: unknown): Result<BookingInput> {
  const obj = asObject(body);
  if (!obj.ok) return obj;

  const missing = FIELDS.filter((f) => obj.value[f] === undefined || obj.value[f] === null);
  if (missing.length > 0) return { ok: false, error: `Missing required field(s): ${missing.join(', ')}` };

  const out: Partial<BookingInput> = {};
  for (const f of FIELDS) {
    const r = checkField(f, obj.value[f]);
    if (!r.ok) return r;
    out[f] = r.value;
  }
  return checkTimeOrder(out as BookingInput);
}

// PATCH: any subset of the fields, at least one. Sent fields are validated exactly
// like POST, then merged over the stored booking. startAt < endAt is checked on the
// merged result, so changing only endAt still can't put it before the stored startAt.
export function validateUpdate(body: unknown, current: BookingInput): Result<BookingInput> {
  const obj = asObject(body);
  if (!obj.ok) return obj;

  const sent = FIELDS.filter((f) => obj.value[f] !== undefined);
  if (sent.length === 0) return { ok: false, error: `Provide at least one field to update: ${FIELDS.join(', ')}` };

  const merged: BookingInput = { ...current };
  for (const f of sent) {
    const r = checkField(f, obj.value[f]);
    if (!r.ok) return r;
    merged[f] = r.value;
  }
  return checkTimeOrder(merged);
}
