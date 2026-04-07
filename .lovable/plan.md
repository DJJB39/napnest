

# Fix Sound Machine — No Audio Playing

## Root Cause

`new AudioContext()` starts in a **suspended** state in modern browsers (autoplay policy). The code calls `source.start()` but never calls `ctx.resume()`, so the audio buffer plays into a suspended context — silence.

Additionally, the `playFile` function silently catches errors (`audio.play().catch(() => {})`), hiding any failures for file-based sounds.

## Fix (1 file)

### `src/components/sleep/SoundMachine.tsx`

1. **`playProgrammatic`**: Add `await ctx.resume()` after creating the AudioContext, before `source.start()`. Make the function `async`.

2. **`playFile`**: Add `console.warn` in the catch block so failures aren't silently swallowed. Also log the URL being attempted.

3. **`handlePlayPause` resume path**: When resuming from pause, also call `ctx.resume()` explicitly (AudioContext may re-suspend after `suspend()` call).

### Specific changes:
- Line 156: `const playProgrammatic = useCallback(async (soundId: SoundId) => {`
- After line 158 (`const ctx = new AudioContext();`): add `await ctx.resume();`
- Line 193: Replace empty catch with `console.warn("Could not play sound file:", fileName, err);`

## What Stays the Same
- All sound definitions, UI, dropdown, volume slider, 3h timer, fade-out logic — unchanged
- Only adding the missing `resume()` call and better error logging

