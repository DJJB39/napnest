

# Upgrade Sound Machine — Dropdown Selector + Audio Files

## Constraint Callout
**Rain/Ocean MP3s**: I cannot download files from Pixabay automatically. I will create a Supabase storage bucket for sound files and provide the UI that plays from it. **You will need to upload the MP3 files** (rain loop, ocean loop) to the bucket after implementation. Plain white/brown noise and Deep Rumble will remain programmatic (Web Audio API).

## What Changes

### 1. Storage Bucket (SQL migration)
- Create `sound_files` public bucket for MP3 uploads
- RLS: public read access (anyone can stream), authenticated insert for admin uploads

### 2. `SoundMachine.tsx` — Full Rewrite
**UI overhaul:**
- Replace two toggle buttons with a `Select` dropdown
- Categories: "White Noise" group (Plain, Rain, Ocean) and "Brown Noise" group (Plain, Deep Rumble)
- Cozy raindrop+Zzz icon in header (inline SVG)
- Play/Pause button, volume slider (keep existing)
- Active sound name displayed with animated equalizer bars

**Audio logic:**
- **Programmatic sounds** (Plain White, Plain Brown, Deep Rumble): Web Audio API buffer generation, same as current but Deep Rumble uses lower frequency filter
- **File-based sounds** (Rain, Ocean): Fetch MP3 from Supabase storage bucket URL, play via `HTMLAudioElement` with loop
- 3-hour auto-stop timer with 30-second fade-out (gain ramp to 0)
- Volume slider controls both programmatic gain node and HTML audio element volume

### 3. `Index.tsx` — Minor
- Update section header emoji/text to match new design

## Files

| File | Action |
|------|--------|
| Migration SQL | Create `sound_files` storage bucket |
| `src/components/sleep/SoundMachine.tsx` | Full rewrite with dropdown, dual audio engine, 3h timer, fade-out |
| `src/pages/Index.tsx` | Update Sound Machine section header |

## Post-Implementation
User uploads rain/ocean MP3s to the `sound_files` bucket at paths `rain.mp3` and `ocean.mp3`. The component will construct the public URL from these paths.

