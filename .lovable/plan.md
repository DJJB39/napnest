

# Configure NapNest as an Installable PWA

## Approach

Per the PWA guidelines, since you want installability (Add to Home Screen) but don't need complex offline caching, the simplest and safest approach is a **manifest-only PWA** — no `vite-plugin-pwa`, no service worker. A valid `manifest.json` with icons and `display: "standalone"` is all browsers need for the install prompt. A service worker would cause stale content issues in the Lovable editor preview and adds complexity without much benefit for this app.

Instead of a service worker, we'll add:
1. A proper manifest with icons
2. Generated PWA icons (192x192 and 512x512) — simple programmatic icons with the NapNest moon/baby theme
3. An install banner component using the `beforeinstallprompt` browser event
4. Meta tags in index.html for Apple devices

## Changes

### 1. Update `public/manifest.json`
- Set `background_color` and `theme_color` to `#1a1a2e`
- Add icon entries pointing to `/icon-192.png` and `/icon-512.png`

### 2. Generate PWA icons
Create two simple SVG-based PNG icons (moon + "Zz" on dark background) at 192x192 and 512x512, placed in `public/`.

### 3. Update `index.html`
- Update `theme-color` meta to `#1a1a2e`
- Add `<link rel="apple-touch-icon" href="/icon-192.png">`
- Add `<meta name="apple-mobile-web-app-capable" content="yes">`
- Add `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`

### 4. Create `src/components/InstallBanner.tsx`
- Listens for the `beforeinstallprompt` event
- Shows a bottom banner on mobile viewports (< 768px) only
- Message: "Add NapNest to your home screen for quick 2am access"
- Install button triggers the native prompt
- Dismiss (X) stores timestamp in localStorage; banner hidden for 30 days
- Does not render in iframes or on preview hosts (safety guard)

### 5. Update `src/App.tsx`
- Import and render `<InstallBanner />` inside the app

### No service worker
A service worker is intentionally omitted. It would break the Lovable editor preview with stale caches and navigation interference. The manifest alone enables "Add to Home Screen" on all modern browsers.

## Files

| File | Action |
|------|--------|
| `public/manifest.json` | Edit — update colors, add icons |
| `public/icon-192.png` | Create — generated icon |
| `public/icon-512.png` | Create — generated icon |
| `index.html` | Edit — add Apple meta tags |
| `src/components/InstallBanner.tsx` | Create — install prompt banner |
| `src/App.tsx` | Edit — add InstallBanner |

