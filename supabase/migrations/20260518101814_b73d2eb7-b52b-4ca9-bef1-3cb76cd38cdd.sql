
DROP POLICY IF EXISTS "Authenticated users can view keys" ON public.enrollment_keys;

CREATE POLICY "Admins can view enrollment keys"
  ON public.enrollment_keys
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Analysts and admins can subscribe to realtime" ON realtime.messages;

CREATE POLICY "Analysts and admins can subscribe to realtime"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'analyst'::app_role)
  );
