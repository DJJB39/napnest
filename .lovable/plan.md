

# Redesign Landing Page Feature Cards

## Problem
The three feature cards (Sleep Tracking, AI Insights, Sound Machine) use light pastel backgrounds that wash out against the gradient hero backdrop. They look generic and lack personality.

## Solution
Replace the pale pastel cards with bold, dark glassmorphic cards that pop against the background. Add playful emoji-driven taglines and a subtle hover glow effect. Each card gets a distinctive gradient icon circle and a cheeky one-liner.

## Changes

### Edit `src/pages/Auth.tsx`

**Feature data** — replace the current `features` array with bolder styling and witty copy:

| Card | Emoji | Title | Tagline | Gradient accent |
|------|-------|-------|---------|-----------------|
| Sleep Tracking | 😴 | One-Tap Tracking | "Because 3am you can't handle buttons" | Teal glow |
| AI Insights | 🧠 | AI Sleep Coach | "Smarter than your mum's advice (sorry mum)" | Purple glow |
| Sound Machine | 🌊 | Sound Machine | "Shhhh machine goes brrr" | Pink glow |

**Card styling** — switch from light pastel `bg-[hsl(...)]` to dark glassmorphic:
- Background: `bg-white/10 dark:bg-white/5` with `backdrop-blur-md`
- Border: `border border-white/20`
- Icon container: gradient background circle (unique per card) with white icon
- Text: white/high-contrast foreground
- Hover: subtle scale + border glow via ring utility

**Layout** — keep the 3-column grid on desktop, stack on mobile. Increase gap slightly for breathing room.

### Files

| File | Action |
|------|--------|
| `src/pages/Auth.tsx` | Edit — redesign feature cards array and card markup (lines 59-168) |

