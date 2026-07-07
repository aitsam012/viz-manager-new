/*
  # Create access items for project access management

  1. New Tables
    - `access_items`
      - `id` (uuid, primary key)
      - `project_id` (uuid) - reference to projects table
      - `type` (text) - access type (Google Analytics, etc.)
      - `date_granted` (date) - when access was granted
      - `status` (text) - Active, Pending, Revoked
      - `email` (text) - access email
      - `website_credentials` (jsonb) - website login credentials
      - `client_email` (jsonb) - client email credentials
      - `notes` (text) - additional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `access_items` table
    - Add policies for access management
*/

CREATE TABLE IF NOT EXISTS access_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type text NOT NULL,
  date_granted date NOT NULL,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Revoked')),
  email text DEFAULT '',
  website_credentials jsonb DEFAULT '{}',
  client_email jsonb DEFAULT '{}',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE access_items ENABLE ROW LEVEL SECURITY;

-- Admins can manage all access items
CREATE POLICY "Admins can manage all access items"
  ON access_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Users can view access items for projects they have access to
CREATE POLICY "Users can view project access items"
  ON access_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_active = true AND (
        u.has_all_projects = true OR
        EXISTS (
          SELECT 1 FROM project_assignments pa
          WHERE pa.user_id = auth.uid() AND pa.project_id = access_items.project_id AND pa.can_view = true
        )
      )
    )
  );

-- Users can edit access items for projects they can edit
CREATE POLICY "Users can edit project access items"
  ON access_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_active = true AND (
        u.role = 'admin' OR
        EXISTS (
          SELECT 1 FROM project_assignments pa
          WHERE pa.user_id = auth.uid() AND pa.project_id = access_items.project_id 
          AND pa.can_edit = true AND 'access' = ANY(pa.editable_sections)
        )
      )
    )
  );

CREATE POLICY "Users can update project access items"
  ON access_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_active = true AND (
        u.role = 'admin' OR
        EXISTS (
          SELECT 1 FROM project_assignments pa
          WHERE pa.user_id = auth.uid() AND pa.project_id = access_items.project_id 
          AND pa.can_edit = true AND 'access' = ANY(pa.editable_sections)
        )
      )
    )
  );

-- Trigger to update updated_at on access item changes
DROP TRIGGER IF EXISTS update_access_items_updated_at ON access_items;
CREATE TRIGGER update_access_items_updated_at
  BEFORE UPDATE ON access_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();