#!/bin/bash
set -e

echo "🔧 Starting build process..."

# Check if node_modules/@types/node exists
if [ ! -d "node_modules/@types/node" ]; then
    echo "❌ @types/node not found. Installing..."
    npm install
fi

echo "📦 Dependencies installed"

# Check TypeScript compiler
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found"
    exit 1
fi

echo "🏗️ Compiling TypeScript..."
npx tsc --project . --listFiles

echo "✅ Build completed successfully!"
echo "📁 Build output:"
ls -la dist/

echo "🎉 Ready to start server!"
