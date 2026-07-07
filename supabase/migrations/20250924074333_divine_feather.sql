/*
  # Create documents table for project document management

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `project_id` (uuid) - reference to projects table
      - `name` (text) - document name
      - `type` (text) - progress-report, google-sheet, looker-studio, internal-doc
      - `url` (text) - document URL
      - `category` (text) - document category
      - `description` (text) - document description
      - `upload_date` (date) - when document was added
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `documents` table
    - Add policies for document management
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'google-sheet' CHECK (type IN ('progress-report', 'google-sheet', 'looker-studio', 'internal-doc')),
  url text NOT NULL,
  category text DEFAULT '',
  description text DEFAULT '',
  upload_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Admins can manage all documents
CREATE POLICY "Admins can manage all documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Users can view documents for projects they have access to
CREATE POLICY "Users can view project documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_active = true AND (
        u.has_all_projects = true OR
        EXISTS (
          SELECT 1 FROM project_assignments pa
          WHERE pa.user_id = auth.uid() AND pa.project_id = documents.project_id AND pa.can_view = true
        )
      )
    )
  );

-- Users can manage documents for projects they can edit
CREATE POLICY "Users can manage project documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_active = true AND (
        u.role = 'admin' OR
        EXISTS (
          SELECT 1 FROM project_assignments pa
          WHERE pa.user_id = auth.uid() AND pa.project_id = documents.project_id 
          AND pa.can_edit = true AND 'documents' = ANY(pa.editable_sections)
        )
      )
    )
  );

CREATE POLICY "Users can update project documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_active = true AND (
        u.role = 'admin' OR
        EXISTS (
          SELECT 1 FROM project_assignments pa
          WHERE pa.user_id = auth.uid() AND pa.project_id = documents.project_id 
          AND pa.can_edit = true AND 'documents' = ANY(pa.editable_sections)
        )
      )
    )
  );

-- Trigger to update updated_at on document changes
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();