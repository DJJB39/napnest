
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Children
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Family Members (junction)
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'parent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, child_id)
);
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Security definer to check family membership (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id UUID, _child_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.family_members WHERE user_id = _user_id AND child_id = _child_id);
$$;

-- Children RLS
CREATE POLICY "Family members can view children" ON public.children FOR SELECT USING (public.is_family_member(auth.uid(), id));
CREATE POLICY "Users can create children" ON public.children FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Family members can update children" ON public.children FOR UPDATE USING (public.is_family_member(auth.uid(), id));

-- Family Members RLS
CREATE POLICY "Users can view own family memberships" ON public.family_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert family memberships" ON public.family_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Invites
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own invites" ON public.invites FOR SELECT USING (auth.uid() = invited_by);
CREATE POLICY "Users can create invites" ON public.invites FOR INSERT WITH CHECK (auth.uid() = invited_by);
CREATE POLICY "Anyone can read invite by token" ON public.invites FOR SELECT USING (true);
CREATE POLICY "Authenticated can update invites" ON public.invites FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Sleep Entries
CREATE TABLE public.sleep_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  sleep_start TIMESTAMPTZ NOT NULL,
  sleep_end TIMESTAMPTZ,
  sleep_type TEXT NOT NULL DEFAULT 'nap',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sleep_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family members can view sleep entries" ON public.sleep_entries FOR SELECT USING (public.is_family_member(auth.uid(), child_id));
CREATE POLICY "Family members can insert sleep entries" ON public.sleep_entries FOR INSERT WITH CHECK (public.is_family_member(auth.uid(), child_id));
CREATE POLICY "Family members can update sleep entries" ON public.sleep_entries FOR UPDATE USING (public.is_family_member(auth.uid(), child_id));

-- Night Wakings
CREATE TABLE public.night_wakings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sleep_entry_id UUID NOT NULL REFERENCES public.sleep_entries(id) ON DELETE CASCADE,
  wake_time TIMESTAMPTZ NOT NULL,
  back_to_sleep_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.night_wakings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family members can view night wakings" ON public.night_wakings FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.sleep_entries se WHERE se.id = sleep_entry_id AND public.is_family_member(auth.uid(), se.child_id)));
CREATE POLICY "Family members can insert night wakings" ON public.night_wakings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.sleep_entries se WHERE se.id = sleep_entry_id AND public.is_family_member(auth.uid(), se.child_id)));
CREATE POLICY "Family members can update night wakings" ON public.night_wakings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.sleep_entries se WHERE se.id = sleep_entry_id AND public.is_family_member(auth.uid(), se.child_id)));

-- AI Reviews
CREATE TABLE public.ai_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  review_text TEXT NOT NULL,
  data_range TEXT,
  model_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family members can view ai reviews" ON public.ai_reviews FOR SELECT USING (public.is_family_member(auth.uid(), child_id));
CREATE POLICY "Family members can insert ai reviews" ON public.ai_reviews FOR INSERT WITH CHECK (public.is_family_member(auth.uid(), child_id));

-- Wake Window Config (reference data)
CREATE TABLE public.wake_window_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_age_weeks INT NOT NULL,
  max_age_weeks INT NOT NULL,
  min_wake_minutes INT NOT NULL,
  max_wake_minutes INT NOT NULL
);
ALTER TABLE public.wake_window_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read wake window config" ON public.wake_window_config FOR SELECT USING (true);

-- Seed NHS defaults
INSERT INTO public.wake_window_config (min_age_weeks, max_age_weeks, min_wake_minutes, max_wake_minutes) VALUES
  (0, 8, 45, 75),
  (8, 12, 60, 90),
  (12, 16, 75, 120),
  (16, 24, 90, 150),
  (24, 36, 120, 180),
  (36, 52, 150, 240),
  (52, 78, 180, 300),
  (78, 520, 240, 360);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sleep_entries_updated_at BEFORE UPDATE ON public.sleep_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for sleep_entries
ALTER PUBLICATION supabase_realtime ADD TABLE public.sleep_entries;
