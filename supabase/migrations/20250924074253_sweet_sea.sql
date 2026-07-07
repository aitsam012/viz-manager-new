/*
  # Create projects table and related structures

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text) - project name
      - `client_name` (text) - client company name
      - `status` (text) - Active, On Pause, Ended
      - `start_date` (date) - project start date
      - `duration` (text) - project duration description
      - `project_type` (text) - milestone, timer, fixed, direct-client
      - `deadline` (date) - for milestone projects
      - `weekly_hours` (integer) - for timer/milestone projects
      - `equivalent_hours` (integer) - for fixed projects
      - `upwork_profile` (text) - associated Upwork profile
      - `business_developer` (text) - BD name
      - `team_members` (text[]) - array of team member names
      - `primary_goals` (text[]) - array of project goals
      - `focus_keywords` (text[]) - array of focus keywords
      - `created_by` (uuid) - user who created the project
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `projects` table
    - Add policies for project access based on user roles and assignments
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_name text NOT NULL,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Pause', 'Ended')),
  start_date date NOT NULL,
  duration text DEFAULT '',
  project_type text NOT NULL DEFAULT 'milestone' CHECK (project_type IN ('milestone', 'timer', 'fixed', 'direct-client')),
  deadline date,
  weekly_hours integer,
  equivalent_hours integer,
  upwork_profile text DEFAULT '',
  business_developer text DEFAULT '',
  team_members text[] DEFAULT '{}',
  primary_goals text[] DEFAULT '{}',
  focus_keywords text[] DEFAULT '{}',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Admins can manage all projects
CREATE POLICY "Admins can manage all projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Users with all_projects access can view all projects
CREATE POLICY "Users with all projects access can view all"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND has_all_projects = true AND is_active = true
    )
  );

-- Users can view projects they created
CREATE POLICY "Users can view own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Trigger to update updated_at on project changes
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();