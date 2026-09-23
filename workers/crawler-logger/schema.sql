CREATE TABLE IF NOT EXISTS crawler_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  path TEXT NOT NULL,
  country TEXT
);

CREATE INDEX IF NOT EXISTS idx_crawler_visits_ts ON crawler_visits (ts);
CREATE INDEX IF NOT EXISTS idx_crawler_visits_bot ON crawler_visits (bot_name);

CREATE TABLE IF NOT EXISTS human_visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  path TEXT NOT NULL,
  country TEXT,
  city TEXT,
  region TEXT
);

CREATE INDEX IF NOT EXISTS idx_human_visits_ts ON human_visits (ts);
CREATE INDEX IF NOT EXISTS idx_human_visits_geo ON human_visits (country, city);

-- Added by migrations_0002_human_quality.sql (fresh installs: run that file after this one)
