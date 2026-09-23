-- Run once: npx wrangler d1 execute kimber-sykes-analytics --remote --file=workers/crawler-logger/migrations_0002_human_quality.sql
ALTER TABLE human_visits ADD COLUMN visitor_id TEXT;
ALTER TABLE human_visits ADD COLUMN browser_confirmed INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_human_visits_visitor ON human_visits (visitor_id);

CREATE TABLE IF NOT EXISTS filtered_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  reason TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_filtered_visits_ts ON filtered_visits (ts);
