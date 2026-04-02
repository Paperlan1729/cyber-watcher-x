
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'analyst', 'viewer');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create user_roles table (separate from profiles per security best practice)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create threats table
CREATE TABLE public.threats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'informational')),
  source TEXT NOT NULL,
  description TEXT,
  log_entry TEXT,
  mitre_technique TEXT,
  campaign TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'contained', 'resolved')),
  detected_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.threats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view threats" ON public.threats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Analysts and admins can create threats" ON public.threats FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Analysts and admins can update threats" ON public.threats FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete threats" ON public.threats FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create agents table
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hostname TEXT NOT NULL,
  ip_address INET NOT NULL,
  os TEXT NOT NULL,
  agent_version TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'isolated', 'compromised')),
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT now(),
  subnet TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view agents" ON public.agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Analysts and admins can manage agents" ON public.agents FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Analysts and admins can update agents" ON public.agents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete agents" ON public.agents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create incidents table for playbook tracking
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  campaign_type TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'contained', 'resolved', 'closed')),
  assigned_to UUID REFERENCES auth.users(id),
  threat_ids UUID[] DEFAULT '{}',
  playbook_steps JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view incidents" ON public.incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Analysts and admins can create incidents" ON public.incidents FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Analysts and admins can update incidents" ON public.incidents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete incidents" ON public.incidents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  -- Assign default 'viewer' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_threats_updated_at BEFORE UPDATE ON public.threats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
