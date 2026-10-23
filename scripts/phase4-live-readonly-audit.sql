-- Buddy Fleets Phase 4: read-only baseline. No DDL, no data changes.
-- Query 1: estimate table sizes; avoid SELECT * of tenant data.
SELECT relname AS table_name,
       pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
       n_live_tup AS estimated_rows,
       seq_scan AS sequential_scans,
       idx_scan AS index_scans
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND relname IN (
    'security_sessions', 'auth_portal_handoffs', 'auth_login_flows',
    'company_portal_operational_records', 'company_portal_vehicles', 'audit_logs'
  )
ORDER BY relname;

-- Query 2: present only actual, direct index metadata on hot session tables.
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('security_sessions', 'auth_portal_handoffs', 'auth_login_flows')
ORDER BY tablename, indexname;

-- Query 3: inspect top 20 most-used indexes before acting on unused-index warnings.
SELECT relname AS table_name, indexrelname AS index_name, idx_scan AS estimated_index_scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC NULLS LAST, relname
LIMIT 20;
