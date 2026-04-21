-- Create logs table for agent-forwarded events
CREATE TABLE public.agent_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  hostname TEXT NOT NULL,
  source TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  raw JSONB,
  event_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_logs_agent_id ON public.agent_logs(agent_id);
CREATE INDEX idx_agent_logs_event_time ON public.agent_logs(event_time DESC);
CREATE INDEX idx_agent_logs_hostname ON public.agent_logs(hostname);

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read logs
CREATE POLICY "Authenticated users can view logs"
ON public.agent_logs FOR SELECT
TO authenticated
USING (true);

-- Only admins can delete
CREATE POLICY "Admins can delete logs"
ON public.agent_logs FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Inserts happen via edge function with service role (bypasses RLS), so no insert policy needed for users

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;

-- Enrollment keys table so the ingest function can validate agents
CREATE TABLE public.enrollment_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  group_name TEXT NOT NULL DEFAULT 'default',
  created_by UUID,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.enrollment_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view keys"
ON public.enrollment_keys FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage keys"
ON public.enrollment_keys FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed one default key so the user can deploy immediately
INSERT INTO public.enrollment_keys (key, group_name)
VALUES ('PLN-DEMO-KEY-CHANGE-ME', 'default');