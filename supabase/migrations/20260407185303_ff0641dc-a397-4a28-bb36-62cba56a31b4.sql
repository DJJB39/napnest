-- Milestones table
CREATE TABLE public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  milestone_key text NOT NULL,
  achieved_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(child_id, milestone_key)
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members can view milestones"
  ON public.milestones FOR SELECT
  USING (public.is_family_member(auth.uid(), child_id));

CREATE POLICY "Family members can insert milestones"
  ON public.milestones FOR INSERT
  WITH CHECK (public.is_family_member(auth.uid(), child_id));

CREATE POLICY "Family members can delete milestones"
  ON public.milestones FOR DELETE
  USING (public.is_family_member(auth.uid(), child_id));

-- Bedtime chapters table
CREATE TABLE public.bedtime_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  chapter_number int NOT NULL,
  title text NOT NULL,
  story_text text NOT NULL,
  illustration_url text,
  materia_name text,
  materia_color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(child_id, chapter_number)
);

ALTER TABLE public.bedtime_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members can view chapters"
  ON public.bedtime_chapters FOR SELECT
  USING (public.is_family_member(auth.uid(), child_id));

CREATE POLICY "Family members can insert chapters"
  ON public.bedtime_chapters FOR INSERT
  WITH CHECK (public.is_family_member(auth.uid(), child_id));

-- Chapter images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('chapter_images', 'chapter_images', true);

CREATE POLICY "Anyone can view chapter images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chapter_images');

CREATE POLICY "Authenticated users can upload chapter images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chapter_images' AND auth.role() = 'authenticated');