#!/bin/bash

# Investo Installer Build Script
# This script builds installers for different platforms

set -e

echo "========================================="
echo "  Building Investo Installer"
echo "========================================="
echo ""

# Check if dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Error: Dependencies not installed."
    echo "Please run './setup.sh' first."
    exit 1
fi

echo "Select platform to build for:"
echo "1) Current platform (auto-detect)"
echo "2) Windows"
echo "3) macOS"
echo "4) Linux"
echo "5) All platforms"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo "Building for current platform..."
        cd frontend
        npm run dist
        ;;
    2)
        echo ""
        echo "Building Windows installer..."
        cd frontend
        npm run dist:win
        ;;
    3)
        echo ""
        echo "Building macOS installer..."
        cd frontend
        npm run dist:mac
        ;;
    4)
        echo ""
        echo "Building Linux packages..."
        cd frontend
        npm run dist:linux
        ;;
    5)
        echo ""
        echo "Building for all platforms... This will take a while."
        cd frontend
        npm run dist:win
        npm run dist:mac
        npm run dist:linux
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

cd ..

echo ""
echo "========================================="
echo "  Build Complete!"
echo "========================================="
echo ""
echo "The installer(s) have been created in:"
echo "  frontend/release/"
echo ""
