#!/bin/bash

# Investo Run Script
# This script starts the application

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

# Build and run the app
echo "Building frontend and starting application..."
echo ""
cd frontend
npm run app
