

# Add "Night Glow" Red Tint Mode

## What It Does
A button placed directly below the SleepButton that activates a full-screen red tint overlay — simulating a "night light" mode to protect baby's (and parent's) eyes during nighttime feeds/checks. Auto-off after 30 minutes, toggle off on second tap.

## Implementation

### 1. New Component: `src/components/sleep/NightGlow.tsx`

**State**: `active` boolean, `timerRef` for 30-min auto-off.

**Button UI**:
- Warm lantern-style button: rounded pill with soft red/coral background (`bg-coral/15`), red icon (Lucide `Flame` or custom lantern SVG), label "Night Glow"
- Subtle glow shadow when active (`glow-coral`)
- Positioned inline (not floating), placed right after SleepButton in the layout

**When active — renders a portal/fixed overlay**:
- `position: fixed; inset: 0; z-index: 999; pointer-events: none`
- `background: #ff0000; opacity: 0.3`
- Applies `filter: brightness(0.4) saturate(0.2)` to the `#root` element via `document.getElementById('root').style.filter`
- Fade-in/out via CSS transition (`transition: opacity 2s ease`)
- Corner Zzz animation: small floating "Zzz" text in bottom-right, animated with CSS keyframes (float up and fade)

**iOS popup**: On first activation, check `navigator.userAgent` for iPhone/iPad. If iOS, show a one-time toast/dialog: "For an even gentler glow, go to Settings > Accessibility > Display > Color Filters > Color Tint > Red." Store dismissal in `localStorage`.

**30-min auto-off**: `setTimeout` of 30 minutes clears the overlay and resets filter. Cleanup on unmount.

**No battery concerns**: Pure CSS overlay + filter, no canvas/WebGL.

### 2. Update `src/pages/Index.tsx`

Insert `<NightGlow />` directly after the `<SleepButton />` line (line 189), wrapped in a motion.div with fade-in animation, before the NightWakingToggle section.

## Files

| File | Action |
|------|--------|
| `src/components/sleep/NightGlow.tsx` | Create — button + overlay + iOS popup + Zzz animation |
| `src/pages/Index.tsx` | Edit — import and place NightGlow below SleepButton |

