# App Timer

A clean, dark-themed countdown / count-up timer designed for *activity timing* — set a duration, hit Start, and when time's up, **snooze** for another configurable interval if you need a few more minutes. The timer keeps counting up the whole time so you always know how long you've actually been at it.

**Live demo:** [kebray-app-timer.netlify.app](https://kebray-app-timer.netlify.app)

## Why "snooze" and not "alarm"?

Most timer apps stop when they hit zero. App Timer is built for the case where you set 10 minutes to clean a room, the timer rings, and you realize you need 5 more — hit *Dismiss*, set a new snooze interval if you want, and the timer keeps counting. You always see both how long you've been going (Total Time) and how long until the next nudge.

## Features

- **Click-to-edit HH:MM:SS picker** — tap a segment to type, with auto-advance after two digits. Or drag/scroll on a segment to nudge that unit (hours, minutes, or seconds).
- **Visual countdown ring** that drains as time elapses.
- **Snooze with a configurable interval** — when the timer hits zero and you dismiss, the timer keeps counting up and the alarm re-fires at your snooze interval (default 5 min). Adjust on the fly with the **Apply New Snooze** button.
- **Quick-set chips** — five configurable presets for fast snooze interval changes (defaults: 2m / 5m / 10m / 15m / 20m).
- **Pause / Resume.**
- **Total Time + Total Snooze** counters so you can see both how long you've been timing and how much of that has been overflow.
- **Settings panel** to set defaults for the timer and snooze, configure the chip values, and enable "use last-used value" recall across sessions.
- **Persistent settings** — your preferences are saved in `localStorage` and survive page reloads.
- **Wake Lock** — screen stays on while the timer is running.
- **Mobile-friendly** — bigger fonts on small screens, full touch support, drag-to-adjust works as expected.
- **Hours support** — up to 99:59:59.
- **Inline reset icon** — small curved-arrow button inside the ring during countdown for one-tap reset.

## Tech

- **Single `index.html` source file** — all HTML, CSS, JavaScript inline. Vanilla JS, no frameworks, no bundler.
- **Tiny Node build step** (`scripts/build.js`, zero npm deps) injects a version string and the `CHANGELOG.md` text into a copy of `index.html` and copies static assets from `public/` to `dist/` before publishing.
- Web Audio API for the chime, Wake Lock API to keep the screen on, `localStorage` for persistence and live-state save-on-refresh.
- Runs in any modern browser — Chrome, Firefox, Safari, Edge — desktop and mobile.

## Run locally

```bash
git clone https://github.com/kebray/timer-app.git
cd timer-app
open index.html         # or: python3 -m http.server 8000 && open http://localhost:8000
```

There's nothing to install. The version label will read `v0.0.0 (dev)` and the changelog modal shows a placeholder until you run a build.

To preview the production build locally:

```bash
node scripts/build.js
open dist/index.html
```

## Install as an app (PWA)

App Timer is a Progressive Web App — it ships with a manifest, an icon, and a service worker, so it's first-class installable:

- **Android Chrome:** menu → "Install app" (or you'll see an install prompt automatically).
- **iOS Safari:** Share → "Add to Home Screen".
- **Desktop Chrome / Edge:** click the install icon in the address bar.

Installed instances run in standalone mode (no browser chrome) and work offline once the app shell has been cached. Each deploy invalidates the old cache so you'll always pick up the latest version on the next launch.

## Deployment

Hosted on [Netlify](https://www.netlify.com/) with auto-deploy on push to `main`. Netlify runs `node build.js` and publishes `dist/`. Configured via [`netlify.toml`](netlify.toml).

Manual deploy:

```bash
node scripts/build.js && netlify deploy --prod --dir=dist
```

## Versioning

- `version.txt` holds the manual semver (bump for meaningful releases).
- The build number is derived from the git commit count (`git rev-list --count HEAD`), so every push produces a new version label without manual intervention.
- The full label looks like **`v0.1.0 (build 47)`** and is shown on the About tab.

## Changelog

User-visible changes are recorded in [`CHANGELOG.md`](CHANGELOG.md), embedded into the app at build time and viewable in-app from About → "View Changelog".

## Roadmap

See [CLAUDE.md](CLAUDE.md) for the full TODO list. Highlights:

- Multiple named timers running at once.
- Configurable alarm sounds and volume.
- Standalone Android (PWA / wrapped) and macOS (menubar countdown via Tauri) builds.
- Automated test suite gating deploys.

## Contributing

This started as a personal-use tool but contributions are welcome. Open an issue or PR.
