
-- Create the sound_files bucket (public so files can be streamed)
INSERT INTO storage.buckets (id, name, public)
VALUES ('sound_files', 'sound_files', true);

-- Anyone can read/stream sound files
CREATE POLICY "Sound files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'sound_files');

-- Authenticated users can upload sound files
CREATE POLICY "Authenticated users can upload sound files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sound_files' AND auth.role() = 'authenticated');
