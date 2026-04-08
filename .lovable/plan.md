

# Fix Install Banner for iOS

## Problem

The install banner **only works on Android/Chrome**. It relies on the `beforeinstallprompt` browser event, which iOS Safari **never fires**. Since you're on iOS, the banner will never appear.

## Solution

Detect iOS Safari users and show a tailored banner with instructions to use the native Share → "Add to Home Screen" flow. Keep the existing Android/Chrome logic for those users.

## Changes

### Edit `src/components/InstallBanner.tsx`

- Add iOS detection: check for `navigator.standalone` (undefined = not installed yet) and iOS user agent
- If iOS + not already in standalone mode → show banner with iOS-specific message: "Tap the Share button ↗ then 'Add to Home Screen'" instead of an Install button
- If Android/Chrome → keep existing `beforeinstallprompt` flow with the Install button
- Both paths respect the same 30-day dismiss, iframe guard, and mobile-only checks
- Also check `display-mode: standalone` media query to hide the banner if already installed

### Files

| File | Action |
|------|--------|
| `src/components/InstallBanner.tsx` | Edit — add iOS Safari detection and instruction banner |

