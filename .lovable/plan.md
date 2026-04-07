

# Upload Rain & Ocean MP3s to Storage Bucket

## Problem
The `sound_files` bucket exists but has an RLS policy requiring `authenticated` role for INSERT. We don't have the service role key in the environment, so we can't upload directly via the Storage API from the sandbox.

## Solution

### Step 1: Create a temporary edge function for uploading
Create `supabase/functions/upload-sound/index.ts` — a simple function that uses the `SUPABASE_SERVICE_ROLE_KEY` (available inside edge functions) to upload files to the `sound_files` bucket.

### Step 2: Generate audio files
Use Python (numpy + scipy) to generate:
- **rain.mp3** — filtered white noise with random raindrop bursts, 30-second loop
- **ocean.mp3** — low-pass filtered noise with slow amplitude modulation simulating wave surges, 30-second loop

### Step 3: Deploy edge function and upload
1. Deploy the `upload-sound` edge function
2. Use `curl` to POST each MP3 file to the edge function
3. Verify files are accessible at the public URLs

### Step 4: Cleanup
Delete the `upload-sound` edge function (it was only needed for the upload).

### Step 5: Verify
Confirm both files play correctly by checking the public Storage URLs match what `SoundMachine.tsx` expects: `${SUPABASE_URL}/storage/v1/object/public/sound_files/rain.mp3`

## Files

| File | Action |
|------|--------|
| `supabase/functions/upload-sound/index.ts` | Create (temporary upload helper) |
| No app code changes needed | — |

## Post-upload
The Sound Machine dropdown options for Rain and Ocean will immediately start working since the component already references the correct bucket paths.

