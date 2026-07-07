/*
  # Create queries table for client Q&A management

  1. New Tables
    - `queries`
      - `id` (uuid, primary key)
      - `project_id` (uuid) - reference to projects table
      - `title` (text) - query title
      - `qa_items` (jsonb) - array of question/answer pairs
      - `linked_sheet` (text) - linked spreadsheet reference
      - `assigned_to` (text) - team member assigned
      - `status` (text) - Open, In Progress, Resolved
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `queries` table
    - Add policies for query management
*/

CREATE TABLE IF NOT EXISTS queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  qa_items jsonb DEFAULT '[]',
  linked_sheet text DEFAULT '',
  assigned_to text DEFAULT '',
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Admins can manage all queries
CREATE POLICY "Admins can manage all queries"
  ON queries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Users can view queries for projects they have access to
CREATE POLICY "Users can view project queries"
  ON queries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_active = true AND (
        u.has_all_projects = true OR
        EXISTS (
          SELECT 1 FROM project_assignments pa
          WHERE pa.user_id = auth.uid() AND pa.project_id = queries.project_id AND pa.can_view = true
        )
      )
    )
  );

-- Users can manage queries for projects they can edit
CREATE POLICY "Users can manage project queries"
  ON queries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_active = true AND (
        u.role = 'admin' OR
        EXISTS (
          SELECT 1 FROM project_assignments pa
          WHERE pa.user_id = auth.uid() AND pa.project_id = queries.project_id 
          AND pa.can_edit = true AND 'queries' = ANY(pa.editable_sections)
        )
      )
    )
  );

CREATE POLICY "Users can update project queries"
  ON queries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_active = true AND (
        u.role = 'admin' OR
        EXISTS (
          SELECT 1 FROM project_assignments pa
          WHERE pa.user_id = auth.uid() AND pa.project_id = queries.project_id 
          AND pa.can_edit = true AND 'queries' = ANY(pa.editable_sections)
        )
      )
    )
  );

-- Trigger to update updated_at on query changes
DROP TRIGGER IF EXISTS update_queries_updated_at ON queries;
CREATE TRIGGER update_queries_updated_at
  BEFORE UPDATE ON queries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();