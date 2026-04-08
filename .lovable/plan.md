

# Add Apple Touch Icons from Uploaded Image

## Approach

Copy the uploaded baby illustration to the project, then use a Python script with Pillow to resize it into four Apple Touch Icon sizes. Update `index.html` with the full set of `<link>` tags.

Note: iOS automatically applies rounded corners to home screen icons — the PNGs should be square (no corner rounding baked in).

## Steps

### 1. Copy uploaded image into project
Copy `user-uploads://IMG_9256.jpeg` to `/tmp/` as a working source.

### 2. Generate 4 icon sizes via Python/Pillow
Crop the image to focus on the baby+cloud illustration (remove or minimize the "NapNest" text at the bottom), then resize to:
- 180×180 → `public/apple-touch-icon.png`
- 167×167 → `public/apple-touch-icon-167x167.png`
- 152×152 → `public/apple-touch-icon-152x152.png`
- 120×120 → `public/apple-touch-icon-120x120.png`

Also regenerate `public/icon-192.png` and `public/icon-512.png` from the same source for manifest consistency.

### 3. Update `index.html`
Replace the single `apple-touch-icon` line (line 14) with the full set:
```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
<link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">
<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
```

## Files

| File | Action |
|------|--------|
| `public/apple-touch-icon.png` | Create — 180×180 |
| `public/apple-touch-icon-152x152.png` | Create — 152×152 |
| `public/apple-touch-icon-167x167.png` | Create — 167×167 |
| `public/apple-touch-icon-120x120.png` | Create — 120×120 |
| `public/icon-192.png` | Regenerate — 192×192 from same source |
| `public/icon-512.png` | Regenerate — 512×512 from same source |
| `index.html` | Edit — replace line 14 with 4 apple-touch-icon links |

