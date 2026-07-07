/*
  # Create audits table for audit management

  1. New Tables
    - `audits`
      - `id` (uuid, primary key)
      - `client_website` (text) - client website URL
      - `project_name` (text) - project name
      - `business_developer` (text) - BD name
      - `auditor` (text) - auditor name
      - `audit_date` (date) - audit date
      - `month` (text) - month in YYYY-MM format
      - `audit_sheet_links` (jsonb) - array of audit sheet links
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `audits` table
    - Add policies for audit management
*/

CREATE TABLE IF NOT EXISTS audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_website text NOT NULL,
  project_name text NOT NULL,
  business_developer text NOT NULL,
  auditor text NOT NULL,
  audit_date date NOT NULL,
  month text NOT NULL,
  audit_sheet_links jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view audits
CREATE POLICY "Authenticated users can view audits"
  ON audits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Admins and managers can manage audits
CREATE POLICY "Admins and managers can manage audits"
  ON audits
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager') AND is_active = true
    )
  );

-- Trigger to update updated_at on audit changes
DROP TRIGGER IF EXISTS update_audits_updated_at ON audits;
CREATE TRIGGER update_audits_updated_at
  BEFORE UPDATE ON audits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();