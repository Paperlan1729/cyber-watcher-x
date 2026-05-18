DROP POLICY IF EXISTS "Authenticated users can view agents" ON public.agents;
CREATE POLICY "Analysts and admins can view agents"
ON public.agents FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'analyst'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));