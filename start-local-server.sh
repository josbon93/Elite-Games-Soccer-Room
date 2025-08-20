#!/bin/bash

echo "================================"
echo "Elite Games Soccer Room Server"  
echo "================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
fi

# Run network setup check
echo "Checking network configuration..."
node package-scripts/setup-local.js

echo
echo "Starting server..."
echo
echo "Server will be available at:"
echo "http://localhost:5000"
echo
echo "For tablet access, use the IP addresses shown above"
echo
echo "Press Ctrl+C to stop the server"
echo

# Start the application
npm run dev