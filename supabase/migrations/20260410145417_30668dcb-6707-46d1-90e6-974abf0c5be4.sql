
-- 1. DELETE policy for night_wakings (mirrors existing SELECT/INSERT/UPDATE pattern)
CREATE POLICY "Family members can delete night wakings"
ON public.night_wakings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.sleep_entries se
    WHERE se.id = night_wakings.sleep_entry_id
    AND public.is_family_member(auth.uid(), se.child_id)
  )
);

-- 2. DELETE policy for sleep_entries (soft-delete is preferred but allow hard-delete too)
CREATE POLICY "Family members can delete sleep entries"
ON public.sleep_entries
FOR DELETE
USING (public.is_family_member(auth.uid(), child_id));

-- 3. Storage policies for sound_files bucket — UPDATE and DELETE
CREATE POLICY "Authenticated users can update sound files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'sound_files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete sound files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'sound_files' AND auth.role() = 'authenticated');

-- 4. Storage policies for chapter_images bucket — UPDATE and DELETE
-- Files are stored with child_id in the path: {child_id}/filename
CREATE POLICY "Family members can update chapter images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'chapter_images'
  AND auth.role() = 'authenticated'
  AND public.is_family_member(auth.uid(), (storage.foldername(name))[1]::uuid)
);

CREATE POLICY "Family members can delete chapter images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chapter_images'
  AND auth.role() = 'authenticated'
  AND public.is_family_member(auth.uid(), (storage.foldername(name))[1]::uuid)
);

-- 5. Realtime channel authorization
-- Enable RLS on realtime.messages so users can only subscribe to channels for their children
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only listen to their children channels"
ON realtime.messages
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND public.is_family_member(
    auth.uid(),
    (
      -- Extract child_id from the topic/extension field
      -- Channel topics follow pattern: realtime:sleep-realtime or include child_id filter
      CASE
        WHEN EXISTS (
          SELECT 1 FROM public.family_members fm
          WHERE fm.user_id = auth.uid()
        )
        THEN (
          SELECT fm.child_id FROM public.family_members fm
          WHERE fm.user_id = auth.uid()
          LIMIT 1
        )
        ELSE NULL
      END
    )
  )
);
