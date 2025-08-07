#!/bin/bash
# Diagnostic script for Render deployment

echo "=== RENDER DEPLOYMENT DIAGNOSTICS ==="
echo "Current working directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo -e "\n=== DIRECTORY CONTENTS ==="
ls -la

echo -e "\n=== PACKAGE.JSON EXISTS? ==="
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    echo "Build script: $(cat package.json | grep -A 1 '"build"')"
else
    echo "❌ package.json not found"
fi

echo -e "\n=== TSCONFIG.JSON EXISTS? ==="
if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json found"
else
    echo "❌ tsconfig.json not found"
fi

echo -e "\n=== SRC DIRECTORY ==="
if [ -d "src" ]; then
    echo "✅ src directory found"
    echo "Contents:"
    ls -la src/
else
    echo "❌ src directory not found"
fi

echo -e "\n=== INSTALLING DEPENDENCIES ==="
npm install

echo -e "\n=== NODE_MODULES CHECK ==="
if [ -d "node_modules" ]; then
    echo "✅ node_modules created"
    echo "TypeScript installed: $(npm list typescript --depth=0 2>/dev/null || echo 'Not found')"
    echo "@types/node installed: $(npm list @types/node --depth=0 2>/dev/null || echo 'Not found')"
else
    echo "❌ node_modules not created"
fi

echo -e "\n=== BUILDING PROJECT ==="
npm run build

echo -e "\n=== BUILD OUTPUT CHECK ==="
if [ -d "dist" ]; then
    echo "✅ dist directory created"
    echo "Contents:"
    ls -la dist/
    if [ -f "dist/server.js" ]; then
        echo "✅ server.js found in dist"
    else
        echo "❌ server.js not found in dist"
    fi
else
    echo "❌ dist directory not created"
fi

echo -e "\n=== DIAGNOSTICS COMPLETE ==="
