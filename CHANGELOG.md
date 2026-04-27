# Changelog

All notable changes to App Timer are recorded here. Newest at the top.

## v0.1.2 — 2026-04-27

### Added
- GitHub icon next to the **View source on GitHub** link on the About screen.
- Toast confirmation after **Check for Updates** — "Updated to vX.Y.Z (build N)" if a new build was pulled, or "You're up to date · vX.Y.Z (build N)" if nothing changed. The button briefly shows "Checking…" while the service worker probes for an update.
- Active tab is now persisted across page reloads (sessionStorage). After Check for Updates the user lands back on the About tab instead of bouncing to Timer.

### Changed
- Layout fixes for tall-content phones (iPhone Pro Max class): the Timer screen now top-aligns and scrolls when its content exceeds the viewport, so the **Apply New Snooze** / **Cancel** buttons can never be hidden behind the bottom tab bar. Bottom padding now accounts for the iOS home-indicator safe area.
- Button rows wrap to multiple lines when the viewport is too narrow to fit them side-by-side.
- Tighter vertical rhythm on mobile (smaller margins around the phase label, totals, divider, and snooze section) so more of the timer UI fits without scrolling.
- The "View source on GitHub" link now sits with a bit more breathing room above it on the About page.

## v0.1.0 — 2026-04-26

### Added
- **Check for Updates** button on the About screen — nudges the service worker to fetch a fresh `sw.js` and asset cache, briefly shows "Checking…" on the button, then reloads. After the reload the user lands back on the About tab (the active tab is persisted in sessionStorage across reloads) and a toast appears: **"Updated to vX.Y.Z (build N)"** if a new version was pulled, or **"You're up to date · vX.Y.Z (build N)"** if nothing changed.
- **Reset to Defaults** button at the bottom of Settings — wipes saved settings (default timer, default snooze, chip values, last-used toggles) and re-applies the built-in defaults.
- Settings → **Save** now returns you to the Timer tab automatically.
- **Progressive Web App support** — installable from browser ("Add to Home Screen" on mobile, install prompt on desktop Chrome/Edge). Includes a web app manifest, an SVG app icon, and a minimal service worker for offline use of the cached app shell. Each deploy gets a fresh cache via build-id-based cache versioning.
- Three-tab UI (Timer / Settings / About) with bottom footer.
- About screen showing app version and a scrollable changelog viewer.
- Auto-incrementing build number in the version string (uses `git rev-list --count HEAD`).
- Pull-to-refresh from the top strip of the page (above the gear-icon-bottom zone) reloads the app.
- Live timer state survives a page refresh — running, paused, snoozing, or alarm-dismissed states all resume seamlessly with continuous wall-clock time.
- HH:MM:SS time inputs are now real `<input>` elements so mobile devices show the numeric soft keyboard on tap.
- Counter-clockwise reset arrow inside the ring during countdown.
- Apply during a sounding alarm now auto-dismisses the alarm.
- Dismiss restarts the snooze cycle from "now," guaranteeing a full snooze interval of quiet.

### Changed
- "Overtime" terminology renamed to "Snooze" everywhere (UI, internal vars, storage keys). Old localStorage keys are migrated automatically.
- Phase labels are now `running` / `alarm` / `snoozing` / `paused` (was `resting` / `wake up` / `time's up` from the Nap-Timer days).
- Pause and Stop buttons are now icon-only circular buttons.
- Progress ring is thicker (8px stroke) and **drains** as time elapses, with a visible grey track for the depleted portion.
- Per-segment drag/scroll: dragging on the hr / min / sec segment now adjusts that unit specifically.
- Layout: action buttons sit between the clock and the snooze section, separated by a horizontal divider line.
- Mobile font sizes bumped a notch via `@media (max-width: 480px)`.

### Removed
- Static gold border around the clock (the SVG progress ring is now the visible ring).
- The +/- buttons above the clock — per-segment drag replaces them.
- The phase-color dot below the buttons — redundant with the ring/text colors.

## v0.0.1 — 2026-04-12

### Added
- Initial single-file HTML5 timer prototype (originally "Nap Timer").
