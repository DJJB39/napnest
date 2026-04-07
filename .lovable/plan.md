

# Add "What to Expect" + "Bedtime Book" Tabs

## Overview

Two new bottom nav tabs with rich, age-aware content. Both derive baby's age from the `children.date_of_birth` already in the DB. No new tables needed for "What to Expect" (static NHS data). "Bedtime Book" needs a `milestones` table to track achieved milestones and chapter unlocks, plus an edge function for AI-generated chapter content and illustrations.

## Navigation Change

Bottom nav grows from 5 to 7 tabs. To fit on mobile, reduce icon size to `w-4 h-4`, label to `text-[9px]`, and shrink `min-w` to `40px`. New items inserted between Reports and Ask AI:
- "Expect" — Lucide `CalendarHeart` icon
- "Stories" — Lucide `BookOpen` icon

## Database

### New table: `milestones`

Tracks which milestones the baby has achieved (used by both tabs).

```sql
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
  USING (is_family_member(auth.uid(), child_id));

CREATE POLICY "Family members can insert milestones"
  ON public.milestones FOR INSERT
  WITH CHECK (is_family_member(auth.uid(), child_id));

CREATE POLICY "Family members can delete milestones"
  ON public.milestones FOR DELETE
  USING (is_family_member(auth.uid(), child_id));
```

### New table: `bedtime_chapters`

Caches AI-generated chapter content so it's not regenerated each visit.

```sql
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
  USING (is_family_member(auth.uid(), child_id));

CREATE POLICY "Family members can insert chapters"
  ON public.bedtime_chapters FOR INSERT
  WITH CHECK (is_family_member(auth.uid(), child_id));
```

## Edge Function: `generate-chapter`

New edge function that generates a bedtime story chapter + illustration using the Lovable AI Gateway.

- Input: `{ childName, chapterNumber, ageMonths, milestonesAchieved[] }`
- Uses `google/gemini-2.5-flash` for story text (system prompt enforces FFVII-inspired cozy tone, length based on age bracket)
- Uses `google/gemini-3.1-flash-image-preview` for illustration (pastel fantasy style, baby hero)
- Uploads illustration to `sound_files` bucket (or a new `chapter_images` bucket)
- Returns `{ title, story_text, illustration_url, materia_name, materia_color }`
- Stores result in `bedtime_chapters` table via service role

## New Pages

### `src/pages/WhatToExpect.tsx`

- Fetches child DOB via same pattern as Index (family_members → children)
- Calculates age in weeks/months
- Fetches milestones from `milestones` table
- Renders a hero card: "At [age], here's what to expect — straight from NHS UK!"
- Shows the matching age range section (0-3mo, 3-6mo, etc.) as the primary card, with other ranges scrollable below
- Each milestone item shows a green check if logged in `milestones` table
- "Mark as achieved" button on each milestone → inserts into `milestones`
- Teething notes section with pastel icons
- Footer: "From NHS.uk"
- Gentle note for unachieved milestones past expected age: "Every baby is different — chat to your health visitor if worried"
- Cozy UI: pastel gradient cards, rounded corners, fade-in animations

### `src/pages/BedtimeBook.tsx`

- Same child data fetching pattern
- Shows 24 chapter cards (Month 0-23) in a vertical scroll
- Locked/unlocked state based on: age >= chapter month AND relevant milestone achieved (for milestone-gated chapters)
- Unlocked chapters show Materia orb with glow animation
- Tapping an unlocked chapter:
  - Check `bedtime_chapters` cache first
  - If not cached, call `generate-chapter` edge function (show loading shimmer)
  - Display story with illustration, Materia orb floating in
  - "Sweet dreams — tomorrow's adventure awaits!" footer
- Narration toggle: uses browser `SpeechSynthesis` API (no external TTS needed)
- Visual progression: early chapters have simple pastel card style, mid chapters richer colors, late chapters have animated starry background

### Milestone-to-Materia Mapping (hardcoded)

| Milestone Key | Month | Materia Name | Color |
|---|---|---|---|
| `smile` | 2 | Smile Materia | gold |
| `head_lift` | 3 | Strength Materia | silver |
| `roll` | 5 | Roll Materia | pink |
| `sit` | 7 | Balance Materia | teal |
| `crawl` | 9 | Crawl Materia | green |
| `pull_stand` | 10 | Rise Materia | purple |
| `walk` | 12 | Walk Materia | blue |
| `climb` | 15 | Climb Materia | orange |
| `run` | 18 | Run Materia | red |
| `kick` | 20 | Power Materia | crimson |

Chapters without a milestone gate unlock purely by age.

## Files Summary

| File | Action |
|---|---|
| Migration SQL | Create `milestones` + `bedtime_chapters` tables with RLS |
| Migration SQL | Create `chapter_images` storage bucket (public) |
| `supabase/functions/generate-chapter/index.ts` | Create — AI story + illustration generation |
| `src/pages/WhatToExpect.tsx` | Create — NHS milestone tracker |
| `src/pages/BedtimeBook.tsx` | Create — chapter list + reader |
| `src/components/layout/BottomNav.tsx` | Edit — add 2 nav items, compact sizing |
| `src/App.tsx` | Edit — add 2 lazy routes |

## What Stays the Same

All existing pages, components, auth, data fetching, sound machine, night glow, ask AI — unchanged. No existing table modifications.

## Scope Note

- AI illustration generation may take 10-20s per chapter. The UI will show a shimmer/skeleton during generation.
- Browser TTS quality varies by device. The narration toggle is a progressive enhancement.
- The 24 chapters are generated on-demand and cached, not pre-generated.

