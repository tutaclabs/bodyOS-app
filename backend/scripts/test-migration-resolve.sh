#!/bin/bash
set -e

echo "Testing migration resolution script..."
echo ""

cd "$(dirname "$0")/.."

echo "✓ Linting..."
npm run lint

echo ""
echo "✓ Building..."
npm run build

echo ""
echo "✓ Script syntax check..."
node -c scripts/resolve-migration.js

echo ""
echo "✓ All checks passed!"
echo ""
echo "The migration resolution script will:"
echo "  1. Try to deploy migrations normally"
echo "  2. If P3009 error (failed migrations):"
echo "     - Mark migration as rolled-back"
echo "     - Try to deploy again"
echo "     - If tables exist, mark as applied"
echo "  3. If tables already exist, mark as applied"
echo ""
echo "Ready for Render deployment!"
