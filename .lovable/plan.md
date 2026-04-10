

# Update Demo Mode — Working Sleep Button + 8 Weeks Newborn Data

## Problem
1. Demo sleep button is disabled (`pointer-events-none`) — users can't interact with it
2. Demo data only covers 30 days with unrealistic patterns for a newborn (too few wakings, too long sleep stretches)
3. Demo dashboard layout is out of sync with the real Index page (missing greeting, inline wake window status line, different structure)

## Changes

### 1. Rewrite `src/lib/demoData.ts` — 8 weeks of realistic newborn data

- Change DOB to ~6 weeks ago (newborn)
- Generate 56 days of data with age-appropriate patterns:
  - Weeks 0-2: 16-17h total sleep, night stretches only 2-3h, 4-6 night wakings, 4-5 short naps
  - Weeks 3-4: night stretches 3-4h, 3-4 night wakings, 4 naps
  - Weeks 5-6: night stretches 4-5h, 2-3 night wakings, 3-4 naps
  - Weeks 7-8: longer stretches emerging, 1-3 night wakings, 3 naps
- Each night entry gets realistic wakings array (not the current 40% chance of 1-2)
- Update NHS range to newborn range (14-17h)
- Expand `demoHistoryEntries` to show more entries (20 instead of 10)
- Update week data to use 8 weeks (this week + last week stays, but data pool is bigger)

### 2. Rewrite `src/pages/Demo.tsx` — working sleep button + match Index layout

**Dashboard tab changes:**
- Add `useState` for `demoActiveSleep` and `demoTodayEntries` (local state, no Supabase)
- Remove `pointer-events-none` from SleepButton — wire `onToggle` to:
  - If awake: create a fake sleep entry with `sleep_start = now`, add to local state
  - If sleeping: set `sleep_end = now` on the active entry, move to today entries
- Match Index page layout: greeting text, inline wake window status line, nap prediction badge, then SleepButton
- Remove the separate `WakeWindowTimer` component (Index doesn't use it)
- Show `NightWakingToggle`-style UI (demo version, local state) when a night sleep is active
- Show `EditStartTime`-style hint when sleeping (can be non-functional or show a toast saying "Demo mode")

**History tab:**
- Show more entries (20+) to reflect the 8-week dataset
- Keep existing card design

### Files

| File | Action |
|------|--------|
| `src/lib/demoData.ts` | Rewrite — 56 days, newborn-realistic wakings, updated NHS range |
| `src/pages/Demo.tsx` | Rewrite — working sleep button with local state, layout matching Index |

