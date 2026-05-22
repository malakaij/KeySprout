#!/bin/bash
set -euo pipefail

# Only run in remote/web environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "→ Installing npm dependencies..."
npm install

echo "→ Generating Prisma client..."
npx prisma generate

echo "✓ Session ready."
