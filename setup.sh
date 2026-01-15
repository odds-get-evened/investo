#!/bin/bash

# Investo Setup Script
# This script installs all dependencies for both backend and frontend

set -e

echo "========================================="
echo "  Investo Setup"
echo "========================================="
echo ""

# Check for Python
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo "✓ Found Python $PYTHON_VERSION"
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

# Install Python dependencies
echo "========================================="
echo "Installing Python dependencies..."
echo "========================================="
cd backend
python3 -m pip install -r requirements.txt
cd ..
echo "✓ Python dependencies installed"
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
