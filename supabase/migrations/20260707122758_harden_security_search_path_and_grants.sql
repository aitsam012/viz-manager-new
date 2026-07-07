-- Security hardening: pin function search_path, revoke anon SELECT, lock internal RPCs
--
-- 1. Function search_path
--    Pin public.handle_new_user, public.update_updated_at_column, public.is_admin
--    to search_path = public, pg_temp so SECURITY DEFINER functions resolve
--    their own dependencies deterministically.
--
-- 2. Revoke anon access on public tables
--    Anon had table-level grants (Supabase default) exposing every public
--    table in the GraphQL schema even though RLS blocked the rows. Revoke
--    all DML from anon on every public table the app owns. Authenticated
--    keeps its grants because signed-in reads are required and RLS enforces
--    per-row visibility.
--
-- 3. Lock internal SECURITY DEFINER functions
--    handle_new_user is a trigger-only function, is_admin is an RLS helper.
--    Neither should be callable via /rest/v1/rpc. Revoke EXECUTE from anon,
--    authenticated, and PUBLIC. service_role retains EXECUTE.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname = 'public' AND p.proname = 'handle_new_user') THEN
    EXECUTE 'ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column') THEN
    EXECUTE 'ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname = 'public' AND p.proname = 'is_admin') THEN
    EXECUTE 'ALTER FUNCTION public.is_admin() SET search_path = public, pg_temp';
  END IF;
END $$;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'users','projects','project_assignments','access_items','queries',
    'documents','audits','reports','google_connections','project_stats'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', t);
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname = 'public' AND p.proname = 'handle_new_user') THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname = 'public' AND p.proname = 'is_admin') THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.is_admin() FROM authenticated';
  END IF;
END $$;
