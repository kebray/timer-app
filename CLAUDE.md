# App Timer

A single-file countdown / count-up "snooze" timer web app. Designed for *activity timing* (e.g. "spend 10 minutes cleaning, then snooze for 5 more if I need it"), not for snoozing a sleep alarm.

## Architecture
- **Single `index.html`** — all HTML, CSS, JS inline. Vanilla JS only, no frameworks, no bundler.
- **Minimal Node build step** (~30 LOC, zero npm dependencies) that injects the version string and the changelog text into a fresh copy of `index.html` written to `dist/`. Netlify runs `node build.js` and serves `dist/`.
- For local dev: just open `index.html` directly in a browser. The build step is skipped — version shows as `v0.0.0 (dev)` and the changelog modal shows a placeholder. To preview the production output locally, run `node build.js` and open `dist/index.html`.
- Must run in all major browsers (Chrome, Firefox, Safari, Edge — desktop and mobile).

## Core Concepts
- **Timer** — the user-set countdown duration (the "main" timer). Range: 1 second to 99:59:59.
- **Snooze interval** — once the timer hits zero and the alarm is dismissed, the timer keeps counting up. The alarm re-fires every snooze-interval seconds (default 5 min). Min snooze interval: 5 seconds.
- **Active vs pending snooze** — during snoozing the user can change the snooze interval; the change goes into a *pending* state and only takes effect when they hit **Apply New Snooze** (which also restarts the countdown to next alarm from "now"). Outside of snoozing, snooze-interval edits commit immediately. **Cancel** discards the pending change.

## Timer Logic
- Setup screen shows an editable HH:MM:SS picker (the "segments"). Default 5:00.
- On Start, countdown begins. When it hits zero, the **alarm sounds** (Web Audio chime, repeats every 3s).
- After **Dismiss**, timer keeps counting up, glow ring turns green, and the central display flips to a **countdown to the next snooze alarm**. At that next zero, alarm fires again. Continues indefinitely.
- **Stop Timer** kills everything and returns to setup.
- **Pause / Resume** freezes both the count and the next-alarm timeout. Available during countdown and snoozing. Hidden during alarm sounding.
- **Reset icon inside the ring** — small curved-arrow button below the clock text, only visible during countdown (before the first alarm). Same effect as Stop Timer.

## HH:MM:SS Picker (segments)
The same picker widget is used for the main timer, the snooze interval, the settings-modal default-timer, default-snooze, and each of the 5 configurable chips. All wired through `buildHmsPicker(container, opts)`.

Per segment (hr / min / sec):
- **Click / tap** → focus segment for typing. Type two digits and it auto-advances to the next segment.
- **↑ / ↓** arrow keys → step that unit by 1.
- **← / →** arrow keys → move focus to the adjacent segment.
- **Enter** → commit and blur. **Backspace / Delete** → zero the segment.
- **Drag up/down** on a segment → adjust *that segment's unit* (hr/min/sec) by 1 per ~5px.
- **Scroll wheel** on a segment → adjust that segment's unit by 1 per tick.
- Drag-vs-tap is disambiguated on pointer-up: ≥5px movement = drag, anything else = tap → focus.

Drag/scroll wiring is in the reusable `bindDragInput(targetEl, opts)` helper.

## Snooze Section
- Always visible, separated from the action buttons by a horizontal divider line.
- Label: "Snooze alarm every".
- Editable HH:MM:SS picker (uses `buildHmsPicker`).
- Five quick-set **chips** (defaults: 2m / 5m / 10m / 15m / 20m). Active chip is highlighted. Chip values are configurable in Settings, validated to be **non-decreasing** with chip 1 ≥ 5s.
- During snoozing, edits go into pending state and a `(pending)` flag appears next to the label. Apply / Cancel buttons appear at the bottom.

## Visual Design
- Dark background `#1a1a2e`, warm gold accent `#e8b84b`, green `#4ecb71`, red `#e85454`, dim `#7a7a8a`.
- **Progress ring** is the main visible ring (SVG circle, stroke-width 8, drains as time passes; track is a faint grey at ~14% white). Color matches phase: gold (running) / green (snoozing dismissed) / red (alarm sounding).
- **Glow ring** around the clock is now shadow-only (no static border) — adds atmosphere; pulses red during alarm.
- **Ring refill** when each alarm fires: the dashoffset transition is briefly disabled so the ring **jump-cuts** back to full instead of sweeping up.
- **Original timer value** is shown as a small "Timer: HH:MM:SS" line under the phase label whenever the timer is running, so the user always knows what they set.
- Below the clock during snooze: **Total Time** (initial + snooze elapsed) and **Total Snooze** (snooze elapsed only).
- **Phase labels** (uppercase via CSS): `set your timer` (setup), `running` (countdown), `alarm` (alarm sounding), `snoozing` (alarm dismissed, in snooze), `paused` (paused).
- **Mobile font bumps** in `@media (max-width: 480px)` for clock, segments, chips, total lines, hint, etc.

## Buttons
| Phase | Visible buttons |
|-------|----------------|
| Setup | Start (gold pill) |
| Countdown | ⏸ Pause (icon, gold) + ⏹ Stop (icon, red) — also small reset icon inside the ring |
| Alarm sounding | Dismiss (green pill) + ⏹ Stop (icon, red) |
| Snoozing (dismissed) | ⏸ Pause (icon) + ⏹ Stop (icon) |
| Snoozing with pending interval change | …plus Cancel + **Apply New Snooze** |

Pause is implemented as an `icon-only` round button whose contents flip between the pause-bars SVG and the play-triangle SVG.

## Alarm Sound
- **Three-tone sine-wave chime** (C5 / E5 / G5, attack 50ms, decay 800ms, staggered 250ms apart). Web Audio API.
- Repeats every 3 seconds until dismissed.
- All in-flight oscillators are tracked in `activeOscillators[]` and aggressively cancelled on stop (gain set to 0, `osc.stop()`, disconnect, then `audioCtx.close()`) so Dismiss / Stop / Apply silence audio immediately.

## Settings Modal
Gear icon in the top-right corner opens a modal containing:
- **Default timer** (HH:MM:SS picker) + "Use last-used timer value instead" toggle.
- **Default snooze interval** (HH:MM:SS picker) + "Use last-used snooze interval instead" toggle.
- **5 quick-chip values** as HH:MM:SS pickers, validated on save: non-decreasing, chip 1 ≥ 5s, all ≥ 0. Inline error message blocks Save until fixed.
- All values persisted to `localStorage` under key `app-timer-settings`.
- **Migration** in `loadSettings`: prior versions used `defaultOvertime` / `lastUsedOvertime` / `useLastUsed` keys — these are auto-copied to the new `defaultSnooze` / `lastUsedSnooze` / `useLastUsedSnooze` names so existing user settings carry over.

## Persistence
- Storage key: `app-timer-settings`
- Schema:
  ```json
  {
    "defaultTimer": 300,
    "useLastUsedTimer": false,
    "lastUsedTimer": 300,
    "defaultSnooze": 300,
    "useLastUsedSnooze": false,
    "lastUsedSnooze": 300,
    "chips": [120, 300, 600, 900, 1200]
  }
  ```
- `lastUsedTimer` is updated on every Start. `lastUsedSnooze` is updated whenever the active snooze interval changes (chip click in setup, segment commit in setup, or Apply during snoozing).

## Technical Notes
- **Wake Lock API** keeps screen on while the timer is running; re-acquires on `visibilitychange`. Safari ignores gracefully.
- Body has `touch-action: none` and `-webkit-user-select: none` to prevent browser gestures and accidental text selection during drag.
- Segments are `<span tabindex="0">` (not real `<input>`s) — focus and typing handled manually so we get full control over drag-vs-tap and the segment-aware drag step.

## Known Bugs Watched in Code
- **Audio leak (fixed)**: `startAlarmSound()` always calls `stopAlarmSound()` first, otherwise repeated `triggerAlarm()` calls would create orphaned `setInterval` handles.
- **AudioContext cleanup (fixed)**: `stopAlarmSound()` cancels gain ramps, calls `osc.stop()`, disconnects nodes, then closes and nulls the AudioContext — so even queued chime tones go silent immediately on Dismiss / Stop.

## Deployment
- **GitHub repo**: [`kebray/timer-app`](https://github.com/kebray/timer-app) (public).
- **Netlify site**: `kebray-app-timer` — https://kebray-app-timer.netlify.app
- **Netlify admin**: https://app.netlify.com/projects/kebray-app-timer
- **Build command**: `node scripts/build.js`. **Publish dir**: `dist/`. Configured via `netlify.toml`.
- **Auto-deploy on push**: live. The Netlify GitHub App is installed with access to all repos under `kebray`, and the repo is linked under `Continuous deployment`. Each push to `main` triggers a build that runs `node scripts/build.js` and publishes `dist/`.
- Manual fallback: `node scripts/build.js && netlify deploy --prod --dir=dist`
- **`scripts/deploy.sh`** — convenience wrapper: `git push` then `netlify watch` to tail the deploy progress until it finishes. Use it instead of bare `git push` when you want to know the moment the deploy is live.

## UI shell (Tabs)

The app is a three-tab single-page UI:

```
┌────────────────────────────────────────┐
│ <main #screens>                        │
│   ┌──────────────────────────────────┐ │
│   │ #screen-timer    (active class)  │ │  ← only one .screen.active at a time
│   ├──────────────────────────────────┤ │
│   │ #screen-settings (hidden)        │ │
│   ├──────────────────────────────────┤ │
│   │ #screen-about    (hidden)        │ │
│   └──────────────────────────────────┘ │
├────────────────────────────────────────┤
│ <nav #footer-tabs>                     │  ← fixed bottom, ~60px tall
│   [Timer] [Settings] [About]           │
└────────────────────────────────────────┘
```

`switchScreen(name)` toggles the `.active` class on screens and tab buttons. Switching to Settings calls `loadSettingsForm()` to repopulate the form from the current `settings` object. Switching to About is a no-op (the version is set once at init).

The previous gear icon in the top-right is gone; Settings is reached via the footer.

The **changelog modal** is a separate floating popup (modal-backdrop pattern), opened from the About screen's "View Changelog" button.

## Build / version / changelog

- **`version.txt`** — manual semver string. Bump for releases (`0.1.0` → `0.2.0`, etc.).
- **`CHANGELOG.md`** — Keep-a-Changelog-style file. Edit by hand; the build embeds it verbatim into the app.
- **`scripts/build.js`** — reads `version.txt`, `CHANGELOG.md`, and `git rev-list --count HEAD` (build number = total commits). Writes `dist/index.html` with a small injected `<script>` that defines `window.APP_VERSION` and `window.CHANGELOG_TEXT` just before the in-page `<script>`. Also copies everything in `public/` into `dist/` (with the `__BUILD_ID__` token in `sw.js` substituted). Anchored to `__dirname` so cwd doesn't matter.
- **`netlify.toml`** — `command = "node scripts/build.js"`, `publish = "dist"`.
- The app reads `window.APP_VERSION` (with a `'v0.0.0 (dev)'` fallback for local) and displays it on the About screen. The changelog modal renders `window.CHANGELOG_TEXT` as preformatted text.
- Auto-incrementing: every push → new commit → bigger commit count → new build number → new version label on the next Netlify deploy.

## PWA

The app is a Progressive Web App, installable from the browser ("Add to Home Screen" on mobile, install prompt on desktop Chrome/Edge).

- **`public/manifest.webmanifest`** — name, icons, `display: standalone`, theme/background colors. Linked from `<head>` via `<link rel="manifest">`.
- **`public/icon.svg`** — single-file SVG icon (gold ring + clock hands on dark background, 512×512 viewBox). Manifest declares both `purpose: any` and `purpose: maskable`. iOS doesn't fully render SVG for `apple-touch-icon` — accept the limitation for now (a PNG export could be added later).
- **`public/sw.js`** — minimal service worker. On install, caches the app shell (`./`, `index.html`, `manifest.webmanifest`, `icon.svg`). Strategy: **network-first** for navigation requests (so deploys propagate on next reload), **cache-first** for static assets, falls back to cache when offline.
- **`__BUILD_ID__`** in `public/sw.js` is replaced by `scripts/build.js` with `app-timer-${version}-${build}` — each deploy invalidates the old cache via the activate handler.
- Apple meta tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style="black-translucent"`, etc.) are set so iOS standalone mode looks right.
- Service worker registration is gated on `'serviceWorker' in navigator` and runs on `load` — silently no-ops on `file://` (local dev). It only activates over https or localhost.

## Future architecture: React rewrite plan (deferred)

When TODO #1 (multiple timers) lands, that's the natural inflection point to rewrite. Until then, the vanilla HTML+JS stays.

**Recommended stack at rewrite time:**
- **React 19 + TypeScript** — components and hooks make multi-timer state much cleaner than hand-managed vanilla; TS catches bugs.
- **Vite + `vite-plugin-pwa`** — replaces the current hand-rolled `sw.js` with a more capable Workbox-based service worker; handles asset hashing, precaching, etc.
- **Plain CSS** (or CSS modules) — Tailwind is optional and not needed; current CSS volume is small.

**Skip during the rewrite (add later only if a specific need shows up):**
- ~~Tailwind CSS~~ — current styles are fine; Tailwind doesn't earn its weight here.
- ~~Dexie.js / IndexedDB~~ — `localStorage` covers the data we have. Switch to Dexie when the data outgrows it (e.g., per-timer history with notes, large audit logs).
- ~~React Router~~ — three tabs = `useState`. Add only when the app grows real navigation depth.

**Migration approach (high level):**
1. Scaffold Vite + React + TS in a new branch. Get a "Hello, App Timer" rendering.
2. Port the timer logic (the IIFE in `index.html`) into a hook (`useTimer`) — pure functions stay pure.
3. Port screens one at a time: Timer → Settings → About → Changelog modal.
4. Reuse the existing `CHANGELOG.md` / `version.txt` — Vite can read them via `import` or a small build plugin.
5. Replace the hand-rolled `sw.js` with `vite-plugin-pwa`'s generated SW, keeping the same network-first/cache-first strategy and manifest content.
6. Update `netlify.toml` build command to `npm run build` and publish dir to `dist/` (Vite's default).

## File Structure
```
timer-app/
  index.html              # App source (template; picks up window.APP_VERSION/CHANGELOG_TEXT if present)
  version.txt             # Manual semver (bump for releases)
  CHANGELOG.md            # Embedded into the app at build time
  netlify.toml            # build = "node scripts/build.js", publish = "dist"
  README.md               # Public-facing project README
  CLAUDE.md               # This file (Claude-focused dev notes)
  .gitignore

  scripts/
    build.js              # Node build script (zero deps)
    deploy.sh             # `git push` + `netlify watch` convenience wrapper

  public/                 # Static assets copied verbatim to dist/ (sw.js gets a build-id substitution)
    manifest.webmanifest  # PWA manifest
    icon.svg              # PWA icon (single SVG, 512x512 viewBox)
    sw.js                 # PWA service worker

  dist/                   # Build output (gitignored)
```

Anything new and static (favicons, additional icon sizes, robots.txt, etc.) goes in `public/` and gets copied to `dist/` automatically — no `build.js` change needed unless the file needs templated substitution.

## TODOs
1. **Multiple timers** — support running several named timers at once (Pixel-Timer-style cards). Major refactor: current code assumes a single global timer.
2. **Configurable alarm sound, volume, and a small library of presets** — sub-tasks:
   - 2a. Volume slider in Settings (0–100%, persist in localStorage).
   - 2b. Multiple built-in alarm sound presets (e.g., chime / beep / bell / digital) selectable in Settings.
   - 2c. Preview-on-select in the Settings modal so users can hear before committing.
3. **Standalone Android app** — decide path: PWA install (low effort, leverages current single-file app + manifest + service worker), wrapped (Capacitor / Trusted Web Activity, store-distributable), or true native (Kotlin/Compose, full rewrite). Default plan: PWA first.
4. **Mac desktop app with menubar countdown** — the menubar countdown is the killer feature and *requires* native shim work. Recommended starting point: Tauri (small bundle, easy menubar APIs, can host the existing `index.html` in the main window while a native menubar item shows the countdown). Alternative: Electron + menubar plugin or native Swift app.
5. **Material You / Material 3 design system** — *clarify scope before starting*: would replace the current dark-gold visual identity. Probably scoped to the Android version only (#3); leave the web app's current theme alone.
6. **Refactor for reusable components and performance** — concrete sub-tasks: (a) extract `buildHmsPicker`, `bindDragInput`, audio engine, and settings store into clearly delineated modules within the file (or split files if we abandon the no-build-step constraint); (b) audit `render()` for unnecessary DOM writes; (c) memoize chip rendering instead of rebuilding the row every render.
7. **Automated tests gating deploys** — set up `tests/` folder with Vitest for pure-function unit tests + Playwright for E2E. Wire into a GitHub Actions workflow that blocks the Netlify deploy on test failure. Test deps stay in `tests/` so the app source remains a single HTML file (the only build dep so far is the tiny `node build.js`).
8. ~~**Public README.md**~~ — done (`README.md`). Iterate from there.
