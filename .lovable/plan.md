

# Rebuild Bottom Nav to 4 Tabs with "More" Page

## Overview
Replace the 7-tab bottom nav with exactly 4 tabs: Home, History, Reports, More. Create a new "More" page that lists all remaining sections as a clean vertical menu.

## Changes

### 1. Create `src/pages/More.tsx`
A clean vertical list page with navigation links to:
- What to Expect
- Bedtime Book (Stories)
- Ask AI
- Settings

Each item: icon on left, label, chevron-right on right. Rounded cards, cozy styling consistent with the app.

### 2. Update `src/components/layout/BottomNav.tsx`
Replace the 7-item `navItems` array with exactly 4:

```text
Home (House icon)  |  History (Clock icon)  |  Reports (BarChart3 icon)  |  More (MoreHorizontal icon)
```

Increase icon size from `w-4 h-4` to `w-5 h-5` and text from `text-[9px]` to `text-[10px]` since there's more space with only 4 tabs.

### 3. Update `src/App.tsx`
- Add lazy import for `More` page
- Add route `/more` inside the AppLayout group

### Files

| File | Action |
|------|--------|
| `src/pages/More.tsx` | Create — vertical menu linking to Expect, Stories, Ask AI, Settings |
| `src/components/layout/BottomNav.tsx` | Edit — reduce to 4 tabs exactly |
| `src/App.tsx` | Edit — add `/more` route |

