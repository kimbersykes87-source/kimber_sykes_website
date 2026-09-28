-- Run once: npx wrangler d1 execute kimber-sykes-analytics --remote --file=workers/crawler-logger/migrations_0003_beacon_and_networks.sql
-- Row writes: one table create (no rows) plus a rewrite of filtered_visits (about one week of rows).
CREATE TABLE IF NOT EXISTS beacon_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  path TEXT NOT NULL,
  country TEXT,
  city TEXT,
  region TEXT,
  visitor_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_beacon_views_ts ON beacon_views (ts);

ALTER TABLE filtered_visits ADD COLUMN detail TEXT;
