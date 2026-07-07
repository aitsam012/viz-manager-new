/*
  # Create project assignments for user permissions

  1. New Tables
    - `project_assignments`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - reference to users table
      - `project_id` (uuid) - reference to projects table
      - `can_view` (boolean) - view permission
      - `can_edit` (boolean) - edit permission
      - `editable_sections` (text[]) - array of editable sections
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `project_assignments` table
    - Add policies for assignment management
*/

CREATE TABLE IF NOT EXISTS project_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  can_view boolean DEFAULT true,
  can_edit boolean DEFAULT false,
  editable_sections text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, project_id)
);

ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;

-- Admins can manage all assignments
CREATE POLICY "Admins can manage all assignments"
  ON project_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Users can view their own assignments
CREATE POLICY "Users can view own assignments"
  ON project_assignments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger to update updated_at on assignment changes
DROP TRIGGER IF EXISTS update_project_assignments_updated_at ON project_assignments;
CREATE TRIGGER update_project_assignments_updated_at
  BEFORE UPDATE ON project_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();