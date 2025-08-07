#!/bin/bash
# Build verification script for Render deployment

echo "🔧 Starting build verification..."

# Check if TypeScript compiles successfully
echo "📦 Compiling TypeScript..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Check if build creates dist folder
echo "🏗️ Building project..."
npm run build

if [ -d "dist" ]; then
    echo "✅ Build directory created successfully"
    echo "📁 Build contents:"
    ls -la dist/
else
    echo "❌ Build directory not created"
    exit 1
fi

# Check if main server file exists
if [ -f "dist/server.js" ]; then
    echo "✅ Main server file exists"
else
    echo "❌ Main server file not found"
    exit 1
fi

echo "🎉 Build verification completed successfully!"
echo "🚀 Ready for Render deployment!"
