-- Optional, run once AFTER the migration: removes past scanner probes and API calls from human_visits
-- so next week's "prior week" comparison is fair. Real page paths are untouched.
-- npx wrangler d1 execute kimber-sykes-analytics --remote --file=workers/crawler-logger/cleanup_0002_remove_probe_history.sql
DELETE FROM human_visits
WHERE path LIKE '/api/%'
   OR path LIKE '/.%' OR path LIKE '%/.%'
   OR lower(path) LIKE '%.php%'
   OR lower(path) LIKE '/wp-%' OR lower(path) LIKE '/xmlrpc%' OR lower(path) LIKE '/cgi-bin%'
   OR lower(path) LIKE '/phpmyadmin%' OR lower(path) LIKE '/admin%' OR lower(path) LIKE '/vendor%'
   OR lower(path) LIKE '%.env' OR lower(path) LIKE '%.sql' OR lower(path) LIKE '%.bak'
   OR lower(path) LIKE '%.ini' OR lower(path) LIKE '%.yml' OR lower(path) LIKE '%.zip';
