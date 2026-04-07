

# 🌙 Baby Sleep Tracker — Full MVP Implementation Plan

## Overview
A beautiful, calming baby sleep tracker web app built with React + Supabase. Dark navy theme, mobile-first, with one-tap sleep logging, wake window tracking, visual reports, AI-powered sleep reviews, and multi-caregiver support.

---

## Phase 1: Foundation — Design System & Layout

### 1.1 Design System Setup
- Override default shadcn theme with the custom dark palette:
  - Base: `#0F172A`, Cards: `#1E293B`, Accent: `#A78BFA` (lavender), Success: `#86EFAC`, Warning: `#F59E0B`, Danger: `#FB7185`
  - Text primary: `#F1F5F9`, Text secondary: `#94A3B8`
- Import Google Fonts: **Inter** (body), **Plus Jakarta Sans** (headings), **JetBrains Mono** (timers/numbers)
- Set dark mode as default, with light mode toggle in settings
- Configure border radius (16px cards, 12px buttons), shadows, and spacing tokens
- Add Framer Motion for page transitions and micro-animations

### 1.2 App Shell & Navigation
- Bottom navigation bar with 4 items: **Home**, **History**, **Reports**, **Settings**
- Mobile-first responsive layout (375px minimum), touch targets ≥ 48px
- Route structure: `/`, `/history`, `/reports`, `/settings`, `/auth`, `/invite`
- Skeleton loaders for all async data screens
- No horizontal scrolling anywhere

---

## Phase 2: Authentication & User Management

### 2.1 Supabase Setup
- Connect Supabase and create the full database schema:
  - `profiles` (auto-created on signup via trigger)
  - `children` (name, DOB, created_by)
  - `family_members` (junction table: user_id, child_id, role)
  - `invites` (email, token, status, expires_at)
  - `sleep_entries` (child_id, sleep_start, sleep_end, sleep_type, is_deleted)
  - `night_wakings` (sleep_entry_id, wake_time, back_to_sleep_time)
  - `ai_reviews` (child_id, review_text, data_range, model_used)
  - `wake_window_config` (age ranges → min/max wake minutes, seeded with NHS defaults)
- RLS policies on all tables using `family_members` lookup for data isolation

### 2.2 Auth Pages
- Registration (email + password) with confirmation email
- Login page with "Forgot password" flow
- Password reset page at `/reset-password`
- Auth state management with protected routes

### 2.3 Onboarding (3 screens max)
- Screen 1: Enter child's name + date of birth
- Screen 2: Quick "tap to log sleep" animation tutorial
- Screen 3: Redirect to dashboard — done in under 30 seconds

---

## Phase 3: Core Sleep Tracking

### 3.1 Hero Sleep Button
- Large circular toggle button (120px+ diameter), centered in bottom third of screen
- **Awake state**: Lavender/indigo color, subtle pulse animation — tap to start sleep
- **Sleeping state**: Warm amber glow animation, elapsed sleep timer — tap to stop
- Single tap, no confirmation dialogs
- Framer Motion state transitions (< 200ms)

### 3.2 Wake Window Timer
- Starts automatically after logging a wake event
- Live elapsed awake time displayed prominently
- Color gradient shift: green → amber → red as age-appropriate wake window approaches
- Thresholds from `wake_window_config` table based on child's age (e.g., 0–8 weeks = 45–75 min)

### 3.3 Auto-Classify Nap vs Night
- Sleep starting 6pm–10pm auto-tagged as "night", otherwise "nap"
- Manual override available on each entry
- Configurable "night start" time in settings

### 3.4 Edit, Delete & Quick-Add
- Tap any entry to edit start/end times (time picker modal)
- Delete with confirmation prompt (soft-delete via `is_deleted` flag)
- "Add past sleep" option with manual date/time entry

### 3.5 Night Waking Log
- During an active night sleep session, "woke up" / "back to sleep" sub-toggle
- Each waking stored with start/end times
- Count of wakings shown in history and reports

---

## Phase 4: Dashboard & Data Views

### 4.1 Today Dashboard (Home Screen)
- Hero section: current state (sleeping/awake) with live timer
- Wake window progress indicator with color shift
- Summary cards: total sleep today, total awake today, nap count
- Real-time updates via Supabase Realtime subscriptions

### 4.2 Sleep History Log
- Scrollable card-based list, newest first
- Each card: date, start/end times, duration, type (nap/night), night waking count
- Filterable by date range
- Paginated Supabase queries

### 4.3 Weekly Summary
- 7-day total + daily average
- Comparison to previous week (up/down indicators)
- Best/worst day highlighted

---

## Phase 5: Visual Reports

### 5.1 Daily Sleep Bar Chart
- Recharts bar chart: total sleep per day over 7/14/30 days
- Color-coded: lighter shade for naps, darker for night sleep
- NHS recommended range shown as a horizontal band overlay
- Dark-mode compatible chart theme

### 5.2 Sleep Pattern Timeline (24hr)
- Horizontal stacked bars per day showing sleep/wake blocks across 24 hours
- Night wakings visible as gaps within sleep blocks
- Scrollable across days to spot evolving patterns

### 5.3 Sleep vs NHS Range
- Daily total plotted against NHS recommended range for child's age
- Green if within range, amber if outside — no anxiety-inducing red alarms
- For newborns: emphasize the wide normal range (8–18 hrs)

---

## Phase 6: AI Sleep Analysis

### 6.1 AI Review (On Demand)
- "Get AI Review" button on Reports page
- Supabase Edge Function calls Gemini 2.5 Flash API
- Sends structured sleep data (last 7 or 14 days) + child's age + NHS context
- Returns natural-language summary with patterns, observations, and age-appropriate recommendations
- Response stored in `ai_reviews` table

### 6.2 AI Behavior
- **Reassurance-first for newborns**: prompt instructs "do NOT recommend strict schedules for under 3 months"
- Pattern identification with cited data (e.g., "bedtime shifted 20 minutes later over 7 days")
- 2–3 actionable, age-appropriate suggestions per review
- Model-agnostic interface (`sendSleepDataForReview(data, model)`) for future provider swapping

### 6.3 AI Review History & Disclaimer
- Past reviews stored and browsable by date
- Persistent disclaimer on every review: "This is informational, not medical advice"
- Link to NHS baby sleep guidance

---

## Phase 7: Multi-Caregiver & Partner Invite

### 7.1 Partner Invite Flow
- Settings → "Invite Partner" → enter partner's email
- Edge Function sends invite email with unique token link (expires in 7 days)
- Partner clicks link → signup page with child auto-linked
- Both partners see identical data via `family_members` RLS lookup

### 7.2 Real-Time Sync
- Supabase Realtime subscriptions on `sleep_entries` table
- When one parent logs sleep, the other sees it within seconds — no manual refresh

---

## Phase 8: Settings & Polish

### 8.1 Settings Page
- Child profile management (edit name, DOB, photo)
- Dark/light mode toggle (defaults to dark, respects OS preference)
- Night start time configuration (for nap/night auto-classify)
- Data export as CSV
- Privacy policy link
- Logout

### 8.2 PWA Configuration
- `manifest.json` with app name, moon/sleep-themed icon, `theme_color: #0F172A`
- Installable from mobile browsers, opens without browser chrome

### 8.3 Empty States & Polish
- Custom calming SVG illustrations (sleeping moon/stars) for empty dashboard, history, and reports
- Friendly copy: "No sleep logged yet — your little one's story starts here"
- Smooth page transitions and card slide-in animations
- No white flash on page load

---

## Technical Notes
- **Stack**: React 18 + Vite + Tailwind + shadcn/ui + Supabase + Recharts + Framer Motion
- **AI**: Gemini 2.5 Flash via Supabase Edge Function (free tier: 250 req/day)
- **Performance**: Lazy-load reports/charts, target Lighthouse > 80, FCP < 2s
- **Privacy**: UK GDPR compliant, data deletion available, no data sold

