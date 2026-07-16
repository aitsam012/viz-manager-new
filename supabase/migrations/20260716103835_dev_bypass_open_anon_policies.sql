-- Temporary dev bypass: allow anon (unauthenticated) full access to app tables so the UI can
-- render without a real Supabase auth session. Reversible by dropping these policies later.

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'users',
    'projects',
    'project_assignments',
    'access_items',
    'queries',
    'documents',
    'audits',
    'reports',
    'google_connections',
    'project_stats'
  ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "dev_bypass_select" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "dev_bypass_insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "dev_bypass_update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "dev_bypass_delete" ON public.%I', t);

    EXECUTE format('CREATE POLICY "dev_bypass_select" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "dev_bypass_insert" ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "dev_bypass_update" ON public.%I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "dev_bypass_delete" ON public.%I FOR DELETE TO anon, authenticated USING (true)', t);
  END LOOP;
END $$;
