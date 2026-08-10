#!/usr/bin/env bash
# Run the data validator with whichever Python has the dependencies.
#
# Locally, deps live in ./.venv (system Python has no jsonschema).
# In CI, deps are installed globally on the runner and there is no venv.
# One command has to work in both places, because `npm run build` calls it.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -x ".venv/bin/python" ]; then
  PY=".venv/bin/python"
elif command -v python3 >/dev/null 2>&1; then
  PY="python3"
else
  echo "error: no python3 found. Run 'npm run setup:py' first." >&2
  exit 1
fi

exec "$PY" scripts/validate.py
