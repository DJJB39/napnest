

# Premium Visual Redesign — NapNest "Dreamy Pastel" Theme

## What Changes

A complete visual overhaul of every page and component, inspired by the reference images: soft pastel gradients, warm rounded cards with gentle shadows, decorative SVG illustrations (sleeping baby, moon, stars, Zzz clouds), playful typography, and micro-animations. No structural/feature changes — same components, same data flow, just a premium skin.

## Design System Overhaul

### Color Palette (CSS variables in `src/index.css`)
- **Background**: Light mode default — soft gradient from `#EBF4FF` (pale blue) to `#FFF0F5` (pale pink)
- **Cards**: White with subtle pink/blue tint, soft `box-shadow: 0 2px 16px rgba(0,0,0,0.06)`
- **Primary**: Teal `#5BB5A2` (sleep button, charts, progress)
- **Accent/CTA**: Warm coral `#F97068` for actions, warm orange `#F59E0B` for "Try Demo"
- **Night**: Deep indigo `#6366F1`
- **Nap**: Soft lavender `#A78BFA`
- **Text**: Dark slate `#1E293B` headings, `#64748B` body/muted
- **Dark mode preserved** — dark navy variant of same palette

### Typography
- Import **Poppins** (700 for headings — playful, rounded) alongside existing Inter
- Titles use Poppins Bold, body stays Inter
- Larger heading sizes, more breathing room

### Global Styles
- `border-radius: 1.25rem` (20px) on all cards, buttons, inputs
- Subtle gradient backgrounds on page wrappers
- Soft drop shadows everywhere (no hard borders)
- Transition on all interactive elements: `transition-all duration-200`

## Files Changed

| File | Change |
|------|--------|
| `src/index.css` | New pastel light-mode-default palette, gradient body bg, Poppins import, glow utilities, decorative SVG patterns as CSS backgrounds |
| `tailwind.config.ts` | Add Poppins to `fontFamily.heading`, add pastel color tokens, add new shadow utilities |
| `src/pages/Auth.tsx` | Gradient hero bg, decorative moon/stars/cloud SVGs (inline JSX), glow effect on Sign Up button, warm orange "Try Demo" button, feature cards with pastel icon backgrounds |
| `src/pages/Demo.tsx` | Same gradient wrapper, softer card styling, teal chart colors, decorative elements |
| `src/pages/Index.tsx` | Gradient page bg, greeting with baby name + emoji, cards with soft shadows, decorative sleeping-baby SVG illustration in header area |
| `src/components/sleep/SleepButton.tsx` | Larger button (40x40), pastel gradient fill (teal awake, indigo sleeping), floating Zzz animation when sleeping, softer glow rings |
| `src/components/sleep/WakeWindowTimer.tsx` | Progress bar with rounded pill shape, gradient fill (green→amber→coral), softer labels |
| `src/components/sleep/TodaySummary.tsx` | Cards with white bg + pastel icon circles, gentle shadows |
| `src/components/sleep/SleepTimer.tsx` | Circular progress ring with gradient stroke, large rounded card wrapper |
| `src/components/sleep/SoundMachine.tsx` | Rounded card with pastel toggle pills, volume slider with teal track |
| `src/components/layout/BottomNav.tsx` | Frosted glass white bg, rounded-top-2xl, active indicator dot, pastel active color |
| `src/components/layout/AppLayout.tsx` | Gradient background wrapper |
| `src/pages/Reports.tsx` | Teal/lavender chart colors, white cards with shadows, softer tooltips |
| `src/pages/History.tsx` | Pastel entry cards with left accent border (indigo for night, lavender for nap) |
| `src/pages/Settings.tsx` | Consistent pastel card styling |
| `src/pages/Onboarding.tsx` | Full-screen gradient, larger illustrations, playful step indicators |
| `src/components/reports/WeeklySummary.tsx` | Pastel card backgrounds, trend icons in colored circles |
| `src/components/reports/SleepTimeline.tsx` | Teal/lavender bar colors on white bg |
| `src/components/sleep/NightWakingToggle.tsx` | Soft card styling |

## Decorative SVG Illustrations (inline JSX, no external files)

1. **Moon & Stars** — crescent moon with 3-5 small stars, used on Auth hero and empty states
2. **Sleeping Cloud / Zzz** — soft cloud with floating Z letters, animated on SleepButton when sleeping
3. **Baby in Nest** — simple stylized nest silhouette with a sleeping baby shape, used on landing hero
4. **Star scatter** — tiny stars as decorative background pattern on page headers

All rendered as inline `<svg>` elements in components — no image files needed.

## Micro-animations

- Buttons: `hover:scale-105 active:scale-95` with spring transition
- Cards: subtle `hover:shadow-lg hover:-translate-y-0.5` lift effect
- Sleep button Zzz: floating upward animation using framer-motion
- Page entries: staggered fade-in (already exists, keep)
- Stars on landing: gentle twinkle (opacity pulse)

## What Stays the Same
- All data fetching, auth, Supabase integration, routing — untouched
- Component props/interfaces — unchanged
- Demo data generation — unchanged
- Feature set — identical

