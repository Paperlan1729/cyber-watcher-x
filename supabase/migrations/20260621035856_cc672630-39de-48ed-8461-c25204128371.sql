
-- 1. Remove auto-assignment of viewer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  -- No default role: admins must explicitly grant access via user_roles.
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 2. Tighten threats SELECT to admin/analyst/viewer
DROP POLICY IF EXISTS "Authenticated users can view threats" ON public.threats;
CREATE POLICY "Role-based users can view threats"
ON public.threats FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'analyst'::public.app_role)
  OR public.has_role(auth.uid(), 'viewer'::public.app_role)
);

-- 3. Tighten incidents SELECT to admin/analyst/viewer
DROP POLICY IF EXISTS "Authenticated users can view incidents" ON public.incidents;
CREATE POLICY "Role-based users can view incidents"
ON public.incidents FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'analyst'::public.app_role)
  OR public.has_role(auth.uid(), 'viewer'::public.app_role)
);

-- 4. Restrict profiles SELECT: own profile, or admin/analyst can see all
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users view own or staff view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'analyst'::public.app_role)
);

-- 5. Tighten agent_logs SELECT: drop viewer to close realtime leak
DROP POLICY IF EXISTS "Role-based users can view logs" ON public.agent_logs;
CREATE POLICY "Admins and analysts can view logs"
ON public.agent_logs FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'analyst'::public.app_role)
);
