/*
# Fix projects RLS to allow project creation and edits by non-admin users

1. Problem
   - The only INSERT-eligible policy on `projects` was "Admins can manage all projects"
     (FOR ALL) whose `WITH CHECK` was NULL, so managers/viewers could not create
     projects at all and even admins could hit "new row violates row-level security"
     depending on the ALL policy's evaluation.
   - No standalone UPDATE/DELETE policies existed for non-admin owners.

2. Changes
   - Add "Users can create projects" INSERT policy: any authenticated user may insert
     as long as `created_by = auth.uid()`.
   - Add "Users can update own projects" UPDATE policy for row owners, and
     "Admins can update all projects" UPDATE policy for admins.
   - Add "Users can delete own projects" DELETE policy for row owners, and
     "Admins can delete all projects" DELETE policy for admins.
   - Keep existing SELECT policies untouched.
   - Drop the overly-broad "Admins can manage all projects" FOR ALL policy so
     command-specific policies apply cleanly.

3. Security
   - RLS remains enabled on `projects`.
   - INSERT requires the row's `created_by` to equal the authenticated user's id.
   - UPDATE/DELETE limited to owner OR admin.
*/

DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Admins can update all projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete all projects" ON projects;

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can update all projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
        AND users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
        AND users.is_active = true
    )
  );

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Admins can delete all projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
        AND users.is_active = true
    )
  );
