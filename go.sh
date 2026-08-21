#!/bin/sh
npm install
find . -maxdepth 1 -name .next -exec rm -rf {} + 2>/dev/null
find . -maxdepth 1 -name out -exec rm -rf {} + 2>/dev/null
find . -maxdepth 1 -name dist -exec rm -rf {} + 2>/dev/null
unset TURBOPACK
npx next build
mv out dist 2>/dev/null
echo "SCRIPT DONE"