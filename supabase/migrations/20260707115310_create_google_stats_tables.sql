/*
# Google Search Console + GA4 stats tables

## Summary
Adds two tables for the Google integration feature:
1. `google_connections` — one row per project, stores the OAuth refresh token, chosen GSC site URL, chosen GA4 property, and the connecting user
2. `project_stats` — daily cached metrics per project (clicks, impressions, CTR, avg position, users, organic users) populated by a scheduled Edge Function

## New tables
### google_connections
- id (uuid, PK)
- project_id (uuid, FK -> projects.id, unique)
- connected_by (uuid, FK -> users.id)
- refresh_token (text) — required to obtain fresh access tokens server-side
- gsc_site_url (text, nullable) — the Search Console property, e.g. sc-domain:example.com or https://example.com/
- ga4_property_id (text, nullable) — GA4 property ID, digits only
- status (text) — 'connected' | 'error' | 'disconnected'
- last_error (text, nullable) — human readable error from last sync attempt
- last_synced_at (timestamptz, nullable)
- created_at, updated_at (timestamptz)

### project_stats
- id (uuid, PK)
- project_id (uuid, FK -> projects.id)
- date (date) — day the metrics cover
- clicks (int, default 0)
- impressions (int, default 0)
- ctr (numeric(6,4), default 0) — 0..1
- position (numeric(6,2), default 0) — avg SERP position
- total_users (int, default 0)
- organic_users (int, default 0)
- created_at, updated_at (timestamptz)
- Unique (project_id, date) — one metrics row per project per day

## Security
- RLS enabled on both tables.
- google_connections: authenticated users can select/insert/update/delete rows for projects they can access (they are the creator OR have an active project_assignment). Refresh tokens are never exposed to the anon client through joins in normal reads because the anon role has no policy.
- project_stats: authenticated users can read stats for their accessible projects. Writes are performed by the Edge Function using the service role which bypasses RLS, so no INSERT/UPDATE policy is added for the client.

## Notes
1. The refresh token is treated as a bearer credential. The frontend saves it once after OAuth. Edge Functions read it via service role.
2. Uniqueness on (project_id, date) allows upsert-by-date in the sync function.
*/

CREATE TABLE IF NOT EXISTS google_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  connected_by uuid REFERENCES users(id) ON DELETE SET NULL,
  refresh_token text NOT NULL,
  gsc_site_url text,
  ga4_property_id text,
  status text NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'error', 'disconnected')),
  last_error text,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date date NOT NULL,
  clicks integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  ctr numeric(6,4) NOT NULL DEFAULT 0,
  position numeric(6,2) NOT NULL DEFAULT 0,
  total_users integer NOT NULL DEFAULT 0,
  organic_users integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (project_id, date)
);

CREATE INDEX IF NOT EXISTS project_stats_project_date_idx ON project_stats(project_id, date DESC);
CREATE INDEX IF NOT EXISTS google_connections_project_idx ON google_connections(project_id);

ALTER TABLE google_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stats ENABLE ROW LEVEL SECURITY;

-- Helper predicate: can this authenticated user access this project?
-- Admins (users.role = 'admin') get everything. Others need an active project_assignment with can_view.

DROP POLICY IF EXISTS "select_own_google_connections" ON google_connections;
CREATE POLICY "select_own_google_connections" ON google_connections FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  OR EXISTS (
    SELECT 1 FROM project_assignments pa
    WHERE pa.project_id = google_connections.project_id
      AND pa.user_id = auth.uid()
      AND pa.can_view = true
  )
  OR EXISTS (SELECT 1 FROM projects p WHERE p.id = google_connections.project_id AND p.created_by = auth.uid())
);

DROP POLICY IF EXISTS "insert_own_google_connections" ON google_connections;
CREATE POLICY "insert_own_google_connections" ON google_connections FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  OR EXISTS (
    SELECT 1 FROM project_assignments pa
    WHERE pa.project_id = google_connections.project_id
      AND pa.user_id = auth.uid()
      AND pa.can_edit = true
  )
  OR EXISTS (SELECT 1 FROM projects p WHERE p.id = google_connections.project_id AND p.created_by = auth.uid())
);

DROP POLICY IF EXISTS "update_own_google_connections" ON google_connections;
CREATE POLICY "update_own_google_connections" ON google_connections FOR UPDATE
TO authenticated USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  OR EXISTS (
    SELECT 1 FROM project_assignments pa
    WHERE pa.project_id = google_connections.project_id
      AND pa.user_id = auth.uid()
      AND pa.can_edit = true
  )
  OR EXISTS (SELECT 1 FROM projects p WHERE p.id = google_connections.project_id AND p.created_by = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  OR EXISTS (
    SELECT 1 FROM project_assignments pa
    WHERE pa.project_id = google_connections.project_id
      AND pa.user_id = auth.uid()
      AND pa.can_edit = true
  )
  OR EXISTS (SELECT 1 FROM projects p WHERE p.id = google_connections.project_id AND p.created_by = auth.uid())
);

DROP POLICY IF EXISTS "delete_own_google_connections" ON google_connections;
CREATE POLICY "delete_own_google_connections" ON google_connections FOR DELETE
TO authenticated USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  OR EXISTS (SELECT 1 FROM projects p WHERE p.id = google_connections.project_id AND p.created_by = auth.uid())
);

DROP POLICY IF EXISTS "select_own_project_stats" ON project_stats;
CREATE POLICY "select_own_project_stats" ON project_stats FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  OR EXISTS (
    SELECT 1 FROM project_assignments pa
    WHERE pa.project_id = project_stats.project_id
      AND pa.user_id = auth.uid()
      AND pa.can_view = true
  )
  OR EXISTS (SELECT 1 FROM projects p WHERE p.id = project_stats.project_id AND p.created_by = auth.uid())
);