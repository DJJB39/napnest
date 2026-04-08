-- Make chapter_images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'chapter_images';

-- Drop existing overly permissive storage policies for chapter_images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chapter images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload chapter images" ON storage.objects;

-- Authenticated family members can read chapter images for their children
CREATE POLICY "Family members can view chapter images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chapter_images' AND
  EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.user_id = auth.uid()
    AND fm.child_id::text = split_part(name, '_', 2)
  )
);

-- Only service role uploads chapter images (via edge function), 
-- but add a restrictive policy for completeness
CREATE POLICY "Service role uploads chapter images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chapter_images' AND
  EXISTS (
    SELECT 1 FROM public.family_members fm
    WHERE fm.user_id = auth.uid()
    AND fm.child_id::text = split_part(name, '_', 2)
  )
);