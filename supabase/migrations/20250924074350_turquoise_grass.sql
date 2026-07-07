/*
  # Create reports table for report scheduling and tracking

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `project_name` (text) - project name
      - `client_name` (text) - client name
      - `upwork_profile` (text) - Upwork profile
      - `business_developer` (text) - BD name
      - `reporting_person` (text) - person responsible for reporting
      - `report_day` (text) - day of week for reports
      - `department_name` (text) - department name
      - `is_active` (boolean) - report schedule status
      - `completion_history` (jsonb) - array of completion records
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `reports` table
    - Add policies for report management
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name text NOT NULL,
  client_name text NOT NULL,
  upwork_profile text NOT NULL,
  business_developer text NOT NULL,
  reporting_person text NOT NULL,
  report_day text NOT NULL CHECK (report_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  department_name text NOT NULL,
  is_active boolean DEFAULT true,
  completion_history jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view reports
CREATE POLICY "Authenticated users can view reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Admins and managers can manage reports
CREATE POLICY "Admins and managers can manage reports"
  ON reports
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true
    )
  );

-- Trigger to update updated_at on report changes
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();