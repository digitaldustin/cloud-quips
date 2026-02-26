
-- Add generations to profiles with default 3 (free tier)
ALTER TABLE public.profiles ADD COLUMN generations integer NOT NULL DEFAULT 3;

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- user_roles RLS: users can read their own roles, admins can read all
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert roles
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete roles
CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Edge function for adding generations (admin or purchase) with 50 cap
CREATE OR REPLACE FUNCTION public.add_generations(_user_id uuid, _amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total integer;
BEGIN
  UPDATE public.profiles
  SET generations = LEAST(generations + _amount, 50),
      updated_at = now()
  WHERE id = _user_id
  RETURNING generations INTO new_total;
  
  RETURN new_total;
END;
$$;

-- Function to consume a generation
CREATE OR REPLACE FUNCTION public.use_generation(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_gens integer;
BEGIN
  SELECT generations INTO current_gens FROM public.profiles WHERE id = _user_id;
  IF current_gens IS NULL OR current_gens <= 0 THEN
    RETURN false;
  END IF;
  UPDATE public.profiles SET generations = generations - 1, updated_at = now() WHERE id = _user_id;
  RETURN true;
END;
$$;
