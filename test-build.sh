#!/bin/bash
# Test TypeScript compilation locally

echo "🔧 Testing TypeScript compilation..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Test TypeScript compilation
echo "🏗️ Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful!"
    echo "📁 Checking dist folder:"
    ls -la dist/
    echo "✅ Ready for deployment!"
else
    echo "❌ TypeScript compilation failed!"
    exit 1
fi
