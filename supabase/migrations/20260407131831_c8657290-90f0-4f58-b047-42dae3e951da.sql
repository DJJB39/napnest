CREATE POLICY "Creators can view own children"
  ON public.children FOR SELECT
  USING (auth.uid() = created_by);