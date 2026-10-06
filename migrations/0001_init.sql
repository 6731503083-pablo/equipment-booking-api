-- Campus Equipment Booking API — schema
-- Times are stored as ISO 8601 UTC strings produced by Date#toISOString()
-- (e.g. 2026-10-20T09:00:00.000Z). Every stored value has the same fixed-width
-- format, so comparing them as TEXT gives the same order as comparing the instants.

CREATE TABLE IF NOT EXISTS equipment (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  location TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id            TEXT PRIMARY KEY,
  equipment_id  TEXT NOT NULL REFERENCES equipment(id),
  borrower_name TEXT NOT NULL,
  start_at      TEXT NOT NULL,
  end_at        TEXT NOT NULL,
  purpose       TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  CHECK (start_at < end_at)
);

-- Speeds up the overlap check, which always filters on one equipment's bookings.
CREATE INDEX IF NOT EXISTS idx_bookings_equipment_time
  ON bookings (equipment_id, start_at, end_at);

INSERT INTO equipment (id, name, location) VALUES
  ('eq-1', 'Projector A', 'Building 1'),
  ('eq-2', 'Camera Canon EOS R6', 'Building 2'),
  ('eq-3', 'Meeting Room M-301', 'Building 3');
