import { Hono, type Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { validateCreate, validateUpdate, type BookingInput } from './validation';

type Bindings = {
  DB: D1Database;
};

type BookingRow = {
  id: string;
  equipment_id: string;
  borrower_name: string;
  start_at: string;
  end_at: string;
  purpose: string;
  created_at: string;
  updated_at: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

// Every error leaves the API as { "error": "..." } — including ones Hono would
// otherwise answer with plain text (unknown route, uncaught exception).
const fail = (c: Context, status: ContentfulStatusCode, message: string) => c.json({ error: message }, status);

app.notFound((c) => fail(c, 404, `Route not found: ${c.req.method} ${c.req.path}`));
app.onError((err, c) => {
  console.error(err);
  return fail(c, 500, 'Internal server error');
});

function toBooking(row: BookingRow) {
  return {
    id: row.id,
    equipmentId: row.equipment_id,
    borrowerName: row.borrower_name,
    startAt: row.start_at,
    endAt: row.end_at,
    purpose: row.purpose,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const INVALID_JSON = Symbol('invalid json');

async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    return INVALID_JSON;
  }
}

async function equipmentExists(db: D1Database, id: string) {
  const row = await db.prepare('SELECT id FROM equipment WHERE id = ?').bind(id).first();
  return row !== null;
}

function findBooking(db: D1Database, id: string) {
  return db.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first<BookingRow>();
}

// Overlap rule, used inside the INSERT and UPDATE below. Bookings are half-open
// intervals [start, end): [a, b) and [c, d) overlap exactly when a < d AND c < b.
// So 09:00–11:00 and 11:00–12:00 do NOT overlap (back-to-back is allowed).
//
// The check sits in the same SQL statement as the write (WHERE NOT EXISTS ...), so
// SQLite checks and writes in one step. With a separate SELECT then INSERT, two
// simultaneous requests could both see "no conflict" and both insert.
const NO_OVERLAP = `NOT EXISTS (
  SELECT 1 FROM bookings other
  WHERE other.equipment_id = ? AND other.id != ? AND other.start_at < ? AND ? < other.end_at
)`;

app.get('/equipment', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT id, name, location FROM equipment ORDER BY id').all();
  return c.json(results);
});

app.get('/bookings', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM bookings ORDER BY start_at, id').all<BookingRow>();
  return c.json(results.map(toBooking));
});

app.get('/bookings/:id', async (c) => {
  const row = await findBooking(c.env.DB, c.req.param('id'));
  if (!row) return fail(c, 404, `Booking not found: ${c.req.param('id')}`);
  return c.json(toBooking(row));
});

app.post('/bookings', async (c) => {
  const body = await readJson(c);
  if (body === INVALID_JSON) return fail(c, 400, 'Request body must be valid JSON');

  const v = validateCreate(body);
  if (!v.ok) return fail(c, 400, v.error);
  const b = v.value;

  if (!(await equipmentExists(c.env.DB, b.equipmentId))) {
    return fail(c, 400, `equipmentId does not exist: ${b.equipmentId}`);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const row = await c.env.DB.prepare(
    `INSERT INTO bookings (id, equipment_id, borrower_name, start_at, end_at, purpose, created_at, updated_at)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?
     WHERE ${NO_OVERLAP}
     RETURNING *`,
  )
    .bind(id, b.equipmentId, b.borrowerName, b.startAt, b.endAt, b.purpose, now, now, b.equipmentId, id, b.endAt, b.startAt)
    .first<BookingRow>();

  if (!row) return fail(c, 409, `Equipment ${b.equipmentId} is already booked for an overlapping time`);
  return c.json(toBooking(row), 201);
});

app.patch('/bookings/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await findBooking(c.env.DB, id);
  if (!existing) return fail(c, 404, `Booking not found: ${id}`);

  const body = await readJson(c);
  if (body === INVALID_JSON) return fail(c, 400, 'Request body must be valid JSON');

  const current: BookingInput = {
    equipmentId: existing.equipment_id,
    borrowerName: existing.borrower_name,
    startAt: existing.start_at,
    endAt: existing.end_at,
    purpose: existing.purpose,
  };
  const v = validateUpdate(body, current);
  if (!v.ok) return fail(c, 400, v.error);
  const b = v.value;

  if (b.equipmentId !== current.equipmentId && !(await equipmentExists(c.env.DB, b.equipmentId))) {
    return fail(c, 400, `equipmentId does not exist: ${b.equipmentId}`);
  }

  // `other.id != ?` excludes this booking from its own overlap check, so moving
  // a booking by 30 minutes doesn't count as a conflict with itself.
  const row = await c.env.DB.prepare(
    `UPDATE bookings
     SET equipment_id = ?, borrower_name = ?, start_at = ?, end_at = ?, purpose = ?, updated_at = ?
     WHERE id = ? AND ${NO_OVERLAP}
     RETURNING *`,
  )
    .bind(b.equipmentId, b.borrowerName, b.startAt, b.endAt, b.purpose, new Date().toISOString(), id, b.equipmentId, id, b.endAt, b.startAt)
    .first<BookingRow>();

  if (!row) {
    // No row updated: either a conflict, or the booking was deleted after we read it.
    if (!(await findBooking(c.env.DB, id))) return fail(c, 404, `Booking not found: ${id}`);
    return fail(c, 409, `Equipment ${b.equipmentId} is already booked for an overlapping time`);
  }
  return c.json(toBooking(row));
});

app.delete('/bookings/:id', async (c) => {
  const result = await c.env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(c.req.param('id')).run();
  if (result.meta.changes === 0) return fail(c, 404, `Booking not found: ${c.req.param('id')}`);
  return c.body(null, 204);
});

export default app;
