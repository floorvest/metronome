#!/bin/bash
set -e
cd "$(dirname "$0")"
npm install
# Next.js 15.x: remove TURBOPACK env to force webpack build
unset TURBOPACK
npx next build
# Cloudflare Pages expects dist/
rm -rf dist
mv out dist 2>/dev/null || true
echo "BUILD SUCCESS"