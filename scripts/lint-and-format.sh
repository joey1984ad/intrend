#!/bin/bash

# Lint and Format Script
echo "🔍 Running ESLint..."
npm run lint

echo ""
echo "✨ Running Prettier formatter..."
npm run format

echo ""
echo "✅ Linting and formatting complete!"
echo ""
echo "Available commands:"
echo "  npm run lint        - Check for linting issues"
echo "  npm run lint:fix    - Fix auto-fixable linting issues"
echo "  npm run format      - Format all files with Prettier"
echo "  npm run format:check - Check if files need formatting"
