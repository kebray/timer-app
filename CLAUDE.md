# App Timer

A single-file countdown/count-up timer web app deployed to Netlify.

## App Name
- **App Timer** (not "Nap Timer" — renamed)
- Netlify subdomain: `kebray-app-timer` (plain `app-timer` was taken)

## Architecture
- **Single `index.html` file** — all HTML, CSS, and JS in one file, no build step, no dependencies
- Must run in all major browsers (Chrome, Firefox, Safari, Edge — desktop and mobile)
- No frameworks, no bundler — vanilla JS only

## Timer Logic
- User sets a duration in seconds (1 second to 90 minutes / 5400 seconds), default 5 minutes (300s)
- **+/- buttons** adjust by 60 seconds per tap; scroll wheel and touch/mouse drag on the clock face adjust by 1 second per tick
- Countdown to zero
- At zero, flips to **counting up** past zero, displayed in green with a `+` prefix (e.g. `+02:15`)
- Alarm **re-fires at every full interval** (e.g. if you set 5 min, alarm fires again at +5:00, +10:00, etc.)
- **Lap badge** shows "2x over", "3x over", etc. on repeat alarms

## Time Setting Controls
- **+/- circular buttons** flanking the clock (always visible during setup)
- **Scroll wheel** on mouse over the clock face (1 second per scroll tick)
- **Touch drag** up/down on the clock face (1 second per ~5px of drag)
- **Mouse drag** up/down on the clock face (same sensitivity as touch)
- A hint below the clock reads "or scroll / drag to adjust"
- All adjustment controls hide when timer is running

## Alarm Sound
- **Three-tone sine wave chime** — frequencies C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz)
- Each tone: sine oscillator, quick attack (50ms), exponential decay over 800ms
- Tones staggered 250ms apart for a soft bowl/chime character
- **Repeats every 3 seconds** until dismissed
- Uses Web Audio API (`AudioContext` / `webkitAudioContext`)

### Proposed future swap (not yet implemented)
- Sharp repeating beep pattern, more phone-alarm aggressive
- Same repeat-every-3s behavior

## Alarm Dismissal
- **Dismiss button** (green): silences alarm sound, timer keeps running and counting up
- **Stop Timer button** (red): kills everything — stops timer, stops sound, returns to setup screen
- Both Dismiss and Stop **immediately kill all sound** by closing the AudioContext
- `startAlarmSound()` always calls `stopAlarmSound()` first to prevent leaked intervals from stacking

## Visual Design
- **Dark background** (`#1a1a2e`), warm gold accent (`#e8b84b`)
- **Glowing ring** (circular border + box-shadow) around the clock changes color by phase:
  - Gold during countdown
  - Green when over time (dismissed)
  - Red with pulsing animation during active alarm
- **Clock text** color matches the ring phase
- **Progress ring** (SVG circle with stroke-dashoffset) shows:
  - During countdown: fraction of time elapsed
  - During overtime: wraps each interval (resets at each alarm boundary)
- **Phase label** text above the clock:
  - `"set your timer"` — setup (gold)
  - `"resting"` — countdown (gold)
  - `"time's up"` — overtime, alarm dismissed (green)
  - `"wake up"` — alarm sounding (red)
- **Phase dot** at the bottom — small circle, color matches current phase

## Button States by Phase
| Phase | Visible buttons |
|-------|----------------|
| Setup | Start (gold, filled) |
| Countdown | Stop Timer (red, outline) |
| Alarm sounding | Dismiss (green) + Stop Timer (red) |
| Overtime (dismissed) | Stop Timer (red, outline) |

## Technical Requirements
- **Wake Lock API** — keeps screen on while timer is running (`navigator.wakeLock.request('screen')`); re-acquires on `visibilitychange`; Safari ignores gracefully
- **Touch and mouse** both fully supported on scroll wheel area
- `touch-action: none` on body to prevent browser gestures interfering
- `-webkit-user-select: none` to prevent text selection during drag

## Known Bugs / Issues to Watch
- **Audio leak bug (fixed)**: `startAlarmSound()` must call `stopAlarmSound()` first, otherwise repeated `triggerAlarm()` calls create orphaned `setInterval` handles that can never be cleared. The fix: always clear before creating a new interval.
- **AudioContext cleanup (fixed)**: `stopAlarmSound()` must close and null the AudioContext to immediately kill any in-flight oscillators, not just clear the interval.

## Deployment and Hosting
- **GitHub repo**: `kebray/timer-app` (public)
- **Netlify site**: `kebray-app-timer` — URL: https://kebray-app-timer.netlify.app
- **Netlify admin**: https://app.netlify.com/projects/kebray-app-timer
- **Auto-deploy on push**: configured via Netlify API linking to GitHub `kebray/timer-app` branch `main`, but the OAuth handshake didn't complete — Netlify can't read the repo. **To fix**: go to Netlify dashboard > Site settings > Build & deploy > Link to GitHub properly through the UI, or continue using `netlify deploy --prod --dir=.` from CLI.
- **No build command** — Netlify serves the directory as-is (publish dir: `/`)
- **Manual deploy command**: `netlify deploy --prod --dir=.`

## File Structure
```
timer-app/
  index.html    # The entire app — HTML + CSS + JS
  CLAUDE.md     # This file
```
