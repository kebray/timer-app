#!/usr/bin/env node
// Minimal build step: injects version + changelog into index.html, copies
// PWA assets from public/ → dist/. No npm dependencies.
//
// Run from the repo root via `node scripts/build.js` (Netlify runs it that
// way from netlify.toml). Paths are anchored to the script file via
// __dirname so cwd doesn't matter.
//
// Inputs:
//   version.txt          — manual semver string (e.g. "0.1.0").
//   CHANGELOG.md         — full changelog text, embedded into the app.
//   index.html           — app source template.
//   public/*             — static assets copied as-is to dist/, except sw.js
//                          which has __BUILD_ID__ replaced.
//   git history          — commit count becomes the auto-incrementing build number.
//
// Output:
//   dist/index.html      — index.html plus a <script> that defines
//                          window.APP_VERSION and window.CHANGELOG_TEXT.
//   dist/<public files>  — copied from public/ verbatim or with substitutions.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DIST_DIR = path.join(ROOT, 'dist');

function rootRead(file, fallback) {
  try { return fs.readFileSync(path.join(ROOT, file), 'utf8'); } catch (_) { return fallback; }
}

const version = (rootRead('version.txt', '0.0.0').trim()) || '0.0.0';
let build = '0';
try {
  build = execSync('git rev-list --count HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch (_) {}
const fullVersion = `v${version} (build ${build})`;
const cacheVersion = `app-timer-${version}-${build}`;

const changelog = rootRead('CHANGELOG.md', '# Changelog\n\nNo changelog data available.\n');

let html = rootRead('index.html', '');
if (!html) {
  console.error('build.js: index.html not found at repo root.');
  process.exit(1);
}

// JSON-encode for safe <script> embedding, plus escape closing-script sequence.
function jsLiteral(str) {
  return JSON.stringify(str).replace(/<\/script/g, '<\\/script');
}

const inject =
  '<script>\n' +
  '  window.APP_VERSION = ' + jsLiteral(fullVersion) + ';\n' +
  '  window.CHANGELOG_TEXT = ' + jsLiteral(changelog) + ';\n' +
  '</script>\n';

const scriptIdx = html.indexOf('<script>');
if (scriptIdx === -1) {
  console.error('build.js: could not find <script> tag in index.html');
  process.exit(1);
}
const out = html.slice(0, scriptIdx) + inject + html.slice(scriptIdx);

fs.mkdirSync(DIST_DIR, { recursive: true });
fs.writeFileSync(path.join(DIST_DIR, 'index.html'), out);

// Copy everything in public/ to dist/. sw.js gets the build id substituted
// into its CACHE_VERSION so each deploy invalidates the old cache.
if (fs.existsSync(PUBLIC_DIR)) {
  for (const name of fs.readdirSync(PUBLIC_DIR)) {
    const src = path.join(PUBLIC_DIR, name);
    const dst = path.join(DIST_DIR, name);
    if (name === 'sw.js') {
      const txt = fs.readFileSync(src, 'utf8').replace(/__BUILD_ID__/g, cacheVersion);
      fs.writeFileSync(dst, txt);
    } else {
      fs.copyFileSync(src, dst);
    }
  }
}

console.log(`build.js: wrote dist/ (${fullVersion})`);
