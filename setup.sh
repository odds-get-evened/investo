#!/bin/bash

# Investo Setup Script
# This script installs all dependencies

set -e

echo "========================================="
echo "  Investo Setup"
echo "========================================="
echo ""

# Check for Node.js
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✓ Found Node.js $NODE_VERSION"
echo ""

# Install Node.js dependencies
echo "========================================="
echo "Installing Node.js dependencies..."
echo "========================================="
cd frontend
npm install
cd ..
echo "✓ Node.js dependencies installed"
echo ""

echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "To run the application:"
echo "  ./run.sh"
echo ""
