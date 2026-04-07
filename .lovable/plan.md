

## Demo Landing Page — Using Real App Components with Mock Data

### Approach
Create a `LandingPage` component at `/auth` that wraps the **actual existing components** (SleepButton, WakeWindowTimer, TodaySummary, WeeklySummary, SleepTimeline, BottomNav, History cards, Reports charts) with 30 days of generated mock data. No new views — just the real UI rendered in a non-interactive demo mode with a "Sign Up" CTA overlay.

### Structure

**1. Mock data generator** (`src/lib/demoData.ts`)
- Generate 30 days of realistic sleep entries for a 4-month-old baby ("Lily"):
  - 1 night sleep per day (7pm–6am with slight variation)
  - 2–3 naps per day (varying 30–90 min durations)
  - Occasional night wakings (0–2 per night)
- Export typed arrays matching `SleepEntry[]` and `DayData[]` interfaces
- Pre-compute today's entries, weekly summaries, and chart data

**2. Landing page layout** (`src/pages/Auth.tsx` — rewrite)
- Top: DreamLog branding + tagline
- Scrollable demo section showing real components in sequence:
  - **Dashboard preview**: `WakeWindowTimer` (with mock lastWakeTime 45 min ago) + `SleepButton` (awake state, non-interactive) + `TodaySummary` (with today's mock entries)
  - **Reports preview**: `WeeklySummary` (with mock this/last week data) + the Recharts `BarChart` and `AreaChart` (same JSX from Reports.tsx, fed mock data) + `SleepTimeline` (with mock entries)
  - **History preview**: A few History-style cards (same card markup from History.tsx)
- Each section labeled with a subtle heading ("Dashboard", "Reports", "History")
- `BottomNav` shown at bottom (non-functional, visual only)
- Floating CTA at bottom: "Start Tracking — It's Free" button → scrolls up to reveal auth form
- Auth form (existing login/signup) shown in a collapsible section at top or via modal

**3. Route changes** (`src/App.tsx`)
- `/auth` renders the new landing page (already does)
- Authenticated users still redirect to `/`

### Files Changed

| File | Change |
|------|--------|
| `src/lib/demoData.ts` | New — generates 30-day mock data |
| `src/pages/Auth.tsx` | Rewrite — landing page with demo + auth form |

### What stays the same
- All existing components are imported and used as-is (SleepButton, WakeWindowTimer, TodaySummary, WeeklySummary, SleepTimeline, BottomNav)
- No new "demo-only" UI components created
- The real charts from Reports.tsx (BarChart, AreaChart) are rendered inline with mock data using the same Recharts JSX

