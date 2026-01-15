#!/bin/bash

# Investo Run Script
# This script starts the application in production mode

set -e

echo "========================================="
echo "  Starting Investo"
echo "========================================="
echo ""

# Check if dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Error: Dependencies not installed."
    echo "Please run './setup.sh' first."
    exit 1
fi

# Check for Python dependencies
if ! python3 -c "import flask" &> /dev/null; then
    echo "Error: Python dependencies not installed."
    echo "Please run './setup.sh' first."
    exit 1
fi

# Build and run the app (Electron will auto-start the backend)
echo "Building frontend and starting application..."
echo ""
cd frontend
npm run app
