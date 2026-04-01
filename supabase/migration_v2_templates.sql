-- =============================================================
-- FXBG Compost Driver — V2 Migration: Templates + Instances
-- =============================================================
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- This creates new tables alongside existing ones (non-destructive).
-- Old tables (routes, stops, pickup_events) are left untouched.
-- Drop them manually once you're confident in the new setup.
-- =============================================================

-- 1. Route Templates — the stable, reusable route definition
CREATE TABLE route_templates (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,                    -- e.g. "Thursday Route + Agora"
  frequency     TEXT NOT NULL DEFAULT 'weekly',   -- 'weekly', 'biweekly', 'monthly'
  notes         JSONB,                            -- admin-only notes
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,    -- soft-delete / retire
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Template Stops — ordered customer list on a template
CREATE TABLE template_stops (
  id            SERIAL PRIMARY KEY,
  template_id   INTEGER NOT NULL REFERENCES route_templates(id) ON DELETE CASCADE,
  customer_id   TEXT NOT NULL REFERENCES customers(stripe_customer_id),
  stop_order    INTEGER NOT NULL,
  stop_type     TEXT DEFAULT 'pickup',
  driver_notes  TEXT,                             -- persistent notes (gate codes, bucket location)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Route Instances — a specific execution of a template on a date
CREATE TABLE route_instances (
  id            SERIAL PRIMARY KEY,
  template_id   INTEGER NOT NULL REFERENCES route_templates(id) ON DELETE RESTRICT,
  date          DATE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active',   -- 'active', 'archived'
  notes         JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Instance Stops — the actual stops for a specific run (copied from template, editable)
CREATE TABLE instance_stops (
  id              SERIAL PRIMARY KEY,
  instance_id     INTEGER NOT NULL REFERENCES route_instances(id) ON DELETE CASCADE,
  template_stop_id INTEGER REFERENCES template_stops(id) ON DELETE SET NULL,  -- trace back to template
  customer_id     TEXT NOT NULL REFERENCES customers(stripe_customer_id),
  stop_order      INTEGER NOT NULL,
  stop_type       TEXT DEFAULT 'pickup',
  driver_notes    TEXT,                           -- copied from template, edits write back
  visible_to_driver BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. New Pickup Events — points to instance_stops instead of old stops
CREATE TABLE v2_pickup_events (
  id                SERIAL PRIMARY KEY,
  instance_stop_id  INTEGER NOT NULL REFERENCES instance_stops(id) ON DELETE CASCADE,
  driver_initials   TEXT NOT NULL,
  completed         BOOLEAN NOT NULL,
  notes             TEXT,                         -- pickup-specific: "bucket overflowing"
  timestamp         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Indexes for performance
-- =============================================================

-- Template stops: fast lookup by template
CREATE INDEX idx_template_stops_template_id ON template_stops(template_id);

-- Instance stops: fast lookup by instance
CREATE INDEX idx_instance_stops_instance_id ON instance_stops(instance_id);

-- Route instances: filter by date and status (driver app home screen)
CREATE INDEX idx_route_instances_date_status ON route_instances(date, status);

-- Route instances: find instances for a template
CREATE INDEX idx_route_instances_template_id ON route_instances(template_id);

-- Pickup events: find events for a stop
CREATE INDEX idx_v2_pickup_events_instance_stop_id ON v2_pickup_events(instance_stop_id);

-- =============================================================
-- Enable Realtime on v2_pickup_events
-- (also toggle this ON in Dashboard → Database → Replication)
-- =============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE v2_pickup_events;

-- =============================================================
-- Done! Old tables (routes, stops, pickup_events) are untouched.
-- You can drop them later with:
--   DROP TABLE IF EXISTS pickup_events;
--   DROP TABLE IF EXISTS stops;
--   DROP TABLE IF EXISTS routes;
-- =============================================================
