# App Timer

A single-file countdown / count-up "snooze" timer web app. Designed for *activity timing* (e.g. "spend 10 minutes cleaning, then snooze for 5 more if I need it"), not for snoozing a sleep alarm.

## Architecture
- **Single `index.html`** — all HTML, CSS, JS inline. No build step, no dependencies, no bundler. Vanilla JS only.
- Must run in all major browsers (Chrome, Firefox, Safari, Edge — desktop and mobile).
- To run locally: open `index.html` directly in a browser.

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
- **Build**: none. Publish dir: `/`.
- **Auto-deploy on push**: the site is linked to the repo in the Netlify dashboard, but GitHub webhooks aren't firing on push (last automatic deploy never happened — only CLI deploys). Likely cause: the Netlify GitHub App isn't fully authorized on the repo; check https://github.com/settings/installations and reinstall on `kebray/timer-app` if Netlify is missing or its access is limited. Manual fallback: `netlify deploy --prod --dir=.`

## File Structure
```
timer-app/
  index.html    # The entire app
  CLAUDE.md     # This file (Claude-focused dev notes)
  README.md     # Public-facing project README
```

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
7. **Automated tests gating deploys** — set up `tests/` folder with Vitest for pure-function unit tests + Playwright for E2E. Trade-off: introduces a build/test toolchain that violates the current "no build, no dependencies" architecture rule for the *app* — keep test deps isolated to `tests/` so the app stays single-file. Wire into a GitHub Actions workflow that blocks the Netlify deploy on test failure.
8. **Public README.md** — done. Iterate from there.
