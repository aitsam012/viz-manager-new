/*
  # Fix project assignments RLS policies

  1. Problem
    - Project assignments policies may also contribute to recursion
    - Need to ensure they don't create circular references

  2. Solution
    - Simplify project assignments policies
    - Use direct user ID checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage all assignments" ON project_assignments;
DROP POLICY IF EXISTS "Users can view own assignments" ON project_assignments;

-- Create simplified policies
CREATE POLICY "Users can view own assignments"
  ON project_assignments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage assignments"
  ON project_assignments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage all assignments"
  ON project_assignments
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());