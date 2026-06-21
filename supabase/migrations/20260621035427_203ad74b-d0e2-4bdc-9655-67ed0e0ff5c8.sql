
-- Tighten agent_logs SELECT to role-based access
DROP POLICY IF EXISTS "Authenticated users can view logs" ON public.agent_logs;
CREATE POLICY "Role-based users can view logs"
ON public.agent_logs
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'analyst'::public.app_role)
  OR public.has_role(auth.uid(), 'viewer'::public.app_role)
);

-- Revoke direct EXECUTE on SECURITY DEFINER functions from API roles.
-- has_role is only used inside RLS policies (evaluated as table owner) and trigger functions.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
