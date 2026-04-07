

## Fix Build Errors + Implement NapNest Revamp

### 1. Fix `chart.tsx` type errors

The `recharts` package was likely updated, breaking type inference on `ChartTooltipContent` and `ChartLegendContent`. Fix by adding explicit type annotations for `payload`, `label`, and `active` props using `any` casts on the destructured props, matching the shadcn/ui pattern for recharts v2.14+.

### 2. Rename DreamLog → NapNest

Update `index.html` title/meta, `manifest.json` name, and any string references in `Settings.tsx` or other components.

### 3. Rewrite Landing Page (`src/pages/Auth.tsx`)

Clean hero section:
- Title: "NapNest: Track Your Baby's Sleep Like Magic"
- Subtitle: "Log naps, get AI tips, soothe with noise — free & simple"
- **Sign Up Free** + **Log In** buttons → toggle inline auth forms
- **Try Demo (No Account)** secondary button → navigates to `/demo`
- Below hero: 3 feature highlight cards (tracking, AI, sound machine)

### 4. New Demo Page (`src/pages/Demo.tsx`)

Public `/demo` route using existing `demoData.ts` + real components (`TodaySummary`, `WeeklySummary`, `SleepTimeline`, charts). Fixed "Ask AI" button shows static advice message. Banner with "Sign up free" CTA.

### 5. Sleep Timer (`src/components/sleep/SleepTimer.tsx`)

3-hour countdown with pause/resume/cancel. Large monospace digits. Rendered on authenticated dashboard.

### 6. Sound Machine (`src/components/sleep/SoundMachine.tsx`)

Web Audio API generates white/brown noise programmatically. Two toggle buttons, volume slider, play/pause. No external files needed.

### 7. Update Dashboard (`src/pages/Index.tsx`)

Add `SleepTimer` and `SoundMachine` below existing sleep button.

### 8. Route Update (`src/App.tsx`)

Add public `/demo` route.

### Files

| File | Action |
|------|--------|
| `src/components/ui/chart.tsx` | Fix type errors |
| `index.html` | Rename to NapNest |
| `public/manifest.json` | Rename to NapNest |
| `src/pages/Auth.tsx` | Rewrite — hero + auth |
| `src/pages/Demo.tsx` | **New** — demo dashboard |
| `src/components/sleep/SleepTimer.tsx` | **New** — countdown |
| `src/components/sleep/SoundMachine.tsx` | **New** — noise player |
| `src/pages/Index.tsx` | Add timer + sound |
| `src/App.tsx` | Add `/demo` route |

