#!/bin/bash

# AI Analysis Debugging Script
# This script will test all components of the AI analysis system

echo ""
echo "========================================"
echo "  AI Analysis Debugging Script"
echo "========================================"
echo ""
echo "This script will test all components of the AI analysis system"
echo "including environment variables, API endpoints, n8n connectivity,"
echo "and database connections."
echo ""
echo "Make sure you have:"
echo "- Node.js installed"
echo "- .env.local file configured"
echo "- Next.js dev server running (optional)"
echo "- n8n running (optional)"
echo ""

read -p "Press Enter to continue..."

echo ""
echo "Starting AI analysis debugging..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if the script exists
if [ ! -f "scripts/debug-ai-analysis.js" ]; then
    echo "ERROR: debug-ai-analysis.js not found"
    echo "Please make sure you're running this from the project root"
    exit 1
fi

# Make the script executable
chmod +x scripts/debug-ai-analysis.js

# Run the debugging script
echo "Running debugging script..."
node scripts/debug-ai-analysis.js

echo ""
echo "Debugging script completed."
echo "Check the output above for any issues."
echo ""
echo "For detailed troubleshooting, see: AI_ANALYSIS_TROUBLESHOOTING.md"
echo ""

read -p "Press Enter to exit..."
