

# NapNest Quality Pass — 8 Changes

## 1. Dark Mode Default (next-themes)

- **main.tsx**: Wrap `<App />` with `<ThemeProvider attribute="class" defaultTheme="dark">` from `next-themes`
- **Settings.tsx**: Remove `isDark` state, the `useEffect` that toggles `document.documentElement.classList` (lines 51-55), and localStorage `napnest_dark` logic. Replace with `const { theme, setTheme } = useTheme()` from `next-themes`. The dark mode switch becomes `checked={theme === "dark"}` / `onCheckedChange={(v) => setTheme(v ? "dark" : "light")}`
- **index.css**: Replace the hardcoded `html { background-color: hsl(210 40% 97%); }` and `.dark html` rules with a single `html { background-color: hsl(var(--background)); }`

## 2. Declutter Home Screen

Restructure **Index.tsx** into 3 zones:

**Zone 1 — Compact header**: Single line greeting + child name using `font-heading` (not `font-display`). Remove `TinyMoonPhases`, `SleepingCloud`, `SleepingBabyNest` decorations. If awake with a `lastWakeTime`, show an inline compact line: "Awake 45m · window 60–90m" with colour indicator — replace the full `<WakeWindowTimer>` card.

**Zone 2 — Hero button**: Nap prediction badge → SleepButton → EditStartTime / NightWakingToggle. No other components above the button.

**Zone 3 — Below fold**: Only `<TodaySummary>`. Remove `<SleepTimer>`, `<SoundMachine>`, and `<NightGlow>` from Index.tsx entirely.

**More.tsx**: Add Sound Machine, Night Glow, and Sleep Timer as new menu items linking to dedicated wrapper pages (or inline-rendered in More). Since SoundMachine/NightGlow/SleepTimer are standalone components, add them as expandable sections directly in the More page for simplicity (no new routes needed).

## 3. Typography — 2 Fonts Only

- **index.css**: Remove Caveat and Poppins from the Google Fonts import. Keep only Inter + JetBrains Mono.
- **tailwind.config.ts**: Remove `display` font family. Change `heading` to `["Inter", "sans-serif"]`.
- **All 9 files** using `font-display`: Replace with `font-heading` or remove. Files: MoonStars.tsx, EditStartTime.tsx, SleepTimer.tsx, AskAI.tsx, Auth.tsx, BedtimeBook.tsx, Demo.tsx, Index.tsx, WhatToExpect.tsx.

## 4. Invite — Copy Link + Share Dialog

In **Settings.tsx** after invite creation:
- Store the invite URL in state (`inviteUrl`)
- Show a second Dialog (`showInviteSuccess`) with the link displayed, plus "Copy Link" and "Share" buttons
- "Copy Link" uses `navigator.clipboard.writeText()`
- "Share" uses `navigator.share()` with clipboard fallback
- Message: "Send this link to your partner. They'll create their own account and be connected to [child name]'s sleep data."

## 5. Reports N+1 Fix

In **Reports.tsx**, replace `fetchDayData` loop with a single query fetching all entries for `viewDays * 2` days. Aggregate client-side by day into `thisWeekData` and `lastWeekData`. This replaces up to 60 HTTP requests with 1.

## 6. Chart Tooltips Dark Mode

In **Reports.tsx**, replace all hardcoded tooltip `contentStyle` objects with:
```typescript
contentStyle={{
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  boxShadow: "0 2px 16px hsl(0 0% 0% / 0.08)",
  color: "hsl(var(--foreground))"
}}
```
Applied to both `<Tooltip>` components (Daily Sleep chart + Sleep Trend chart).

## 7. Shared Settings to Database

**Migration**: Add `night_start_hour INTEGER DEFAULT 18` and `handover_mode BOOLEAN DEFAULT false` to the `children` table.

**Settings.tsx**: Read/write `night_start_hour` and `handover_mode` from the `children` table via Supabase instead of localStorage. Add section labels: "Shared Settings" and "This Device".

## 8. Error Boundary

Create **src/components/ErrorBoundary.tsx**: React class component with `componentDidCatch`, renders a friendly screen with moon illustration, "Something went wrong", and a reload button.

Wrap `<Routes>` in **App.tsx** with `<ErrorBoundary>`.

---

## Files Summary

| File | Action |
|------|--------|
| `src/main.tsx` | Edit — wrap with ThemeProvider |
| `src/index.css` | Edit — remove Caveat/Poppins import, fix html bg |
| `tailwind.config.ts` | Edit — remove display font, change heading to Inter |
| `src/pages/Index.tsx` | Edit — declutter to 3 zones, inline wake timer |
| `src/pages/More.tsx` | Edit — add Sound Machine, Night Glow, Sleep Timer sections |
| `src/pages/Settings.tsx` | Edit — next-themes, invite dialog, shared settings from DB |
| `src/pages/Reports.tsx` | Edit — single query, dark mode tooltips |
| `src/components/ErrorBoundary.tsx` | Create |
| `src/App.tsx` | Edit — add ErrorBoundary wrap |
| 9 files with `font-display` | Edit — replace with `font-heading` |
| Migration | Add `night_start_hour`, `handover_mode` to `children` |

