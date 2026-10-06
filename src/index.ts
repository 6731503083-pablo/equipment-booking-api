import { Hono } from 'hono';

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

async function equipmentExists(db: D1Database, id: string) {
  const row = await db.prepare('SELECT id FROM equipment WHERE id = ?').bind(id).first();
  return row !== null;
}

// Two intervals [a, b) and [c, d) overlap when a < d AND c < b.
async function hasOverlap(db: D1Database, equipmentId: string, startAt: string, endAt: string, excludeId: string | null) {
  const row = await db
    .prepare(
      `SELECT id FROM bookings
       WHERE equipment_id = ? AND start_at < ? AND ? < end_at AND id != ?
       LIMIT 1`,
    )
    .bind(equipmentId, endAt, startAt, excludeId ?? '')
    .first();
  return row !== null;
}

app.get('/equipment', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT id, name, location FROM equipment ORDER BY id').all();
  return c.json(results);
});

app.get('/bookings', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM bookings ORDER BY start_at').all<BookingRow>();
  return c.json(results.map(toBooking));
});

app.get('/bookings/:id', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(c.req.param('id')).first<BookingRow>();
  if (!row) return c.json({ error: 'Booking not found' }, 404);
  return c.json(toBooking(row));
});

app.post('/bookings', async (c) => {
  const body = await c.req.json();
  const { equipmentId, borrowerName, startAt, endAt, purpose } = body;

  if (!equipmentId || !borrowerName || !startAt || !endAt || !purpose) {
    return c.json({ error: 'equipmentId, borrowerName, startAt, endAt and purpose are required' }, 400);
  }
  if (isNaN(Date.parse(startAt)) || isNaN(Date.parse(endAt))) {
    return c.json({ error: 'startAt and endAt must be valid dates' }, 400);
  }
  if (startAt >= endAt) {
    return c.json({ error: 'startAt must be before endAt' }, 400);
  }
  if (!(await equipmentExists(c.env.DB, equipmentId))) {
    return c.json({ error: 'equipmentId does not exist' }, 400);
  }
  if (await hasOverlap(c.env.DB, equipmentId, startAt, endAt, null)) {
    return c.json({ error: 'This equipment is already booked for an overlapping time' }, 409);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `INSERT INTO bookings (id, equipment_id, borrower_name, start_at, end_at, purpose, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, equipmentId, borrowerName, startAt, endAt, purpose, now, now)
    .run();

  const row = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first<BookingRow>();
  return c.json(toBooking(row!), 201);
});

app.patch('/bookings/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first<BookingRow>();
  if (!existing) return c.json({ error: 'Booking not found' }, 404);

  const body = await c.req.json();
  const merged = {
    equipmentId: body.equipmentId ?? existing.equipment_id,
    borrowerName: body.borrowerName ?? existing.borrower_name,
    startAt: body.startAt ?? existing.start_at,
    endAt: body.endAt ?? existing.end_at,
    purpose: body.purpose ?? existing.purpose,
  };

  if (isNaN(Date.parse(merged.startAt)) || isNaN(Date.parse(merged.endAt))) {
    return c.json({ error: 'startAt and endAt must be valid dates' }, 400);
  }
  if (merged.startAt >= merged.endAt) {
    return c.json({ error: 'startAt must be before endAt' }, 400);
  }
  if (!(await equipmentExists(c.env.DB, merged.equipmentId))) {
    return c.json({ error: 'equipmentId does not exist' }, 400);
  }
  if (await hasOverlap(c.env.DB, merged.equipmentId, merged.startAt, merged.endAt, id)) {
    return c.json({ error: 'This equipment is already booked for an overlapping time' }, 409);
  }

  await c.env.DB.prepare(
    `UPDATE bookings SET equipment_id = ?, borrower_name = ?, start_at = ?, end_at = ?, purpose = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(merged.equipmentId, merged.borrowerName, merged.startAt, merged.endAt, merged.purpose, new Date().toISOString(), id)
    .run();

  const row = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first<BookingRow>();
  return c.json(toBooking(row!));
});

app.delete('/bookings/:id', async (c) => {
  const result = await c.env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(c.req.param('id')).run();
  if (result.meta.changes === 0) return c.json({ error: 'Booking not found' }, 404);
  return c.body(null, 204);
});

export default app;
