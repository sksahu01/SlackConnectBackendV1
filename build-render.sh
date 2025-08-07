#!/bin/bash
set -e

echo "🔧 Custom build script for Render"

# Ensure we're in the right directory
echo "📍 Current directory: $(pwd)"
echo "📁 Directory contents:"
ls -la

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production
npm install typescript @types/node --save-dev

# Verify TypeScript installation
echo "🔍 Verifying TypeScript..."
npx tsc --version

# Clean any existing build
echo "🧹 Cleaning build directory..."
rm -rf dist

# Build the project
echo "🏗️ Building TypeScript project..."
npx tsc

# Verify build output
echo "✅ Build completed. Checking output..."
if [ -d "dist" ]; then
    echo "✅ dist directory created"
    ls -la dist/
    if [ -f "dist/server.js" ]; then
        echo "✅ server.js found in dist/"
        echo "🎉 Build successful!"
    else
        echo "❌ server.js not found in dist/"
        exit 1
    fi
else
    echo "❌ dist directory not created"
    exit 1
fi
