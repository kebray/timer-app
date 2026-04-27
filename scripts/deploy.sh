#!/usr/bin/env bash
# Push to origin, then watch the Netlify deploy until it finishes.
# Usage: ./scripts/deploy.sh            (pushes the current branch)
#        ./scripts/deploy.sh --force    (or any other args git push accepts)
set -euo pipefail

git push "$@"
echo
echo "→ pushed; watching Netlify deploy (Ctrl-C to detach, the build still runs)..."
exec netlify watch
