-- Run once: npx wrangler d1 execute kimber-sykes-analytics --remote --file=workers/crawler-logger/migrations_0004_active_time.sql
-- Row writes: rewrites beacon_views, which currently holds only a handful of rows.
ALTER TABLE beacon_views ADD COLUMN view_id TEXT;
ALTER TABLE beacon_views ADD COLUMN active_ms INTEGER;
CREATE INDEX IF NOT EXISTS idx_beacon_views_view ON beacon_views (view_id);
