#!/bin/bash

echo "🧪 Testing Production Environment"
echo "=================================="

echo ""
echo "1. Testing backend health..."
curl -s https://slackconnectbackendv1.onrender.com/api/health | python -m json.tool

echo ""
echo "2. Testing debug config..."
curl -s https://slackconnectbackendv1.onrender.com/api/debug/config | python -m json.tool

echo ""
echo "3. Frontend URL: https://slackconnectfrontendv1.netlify.app"
echo ""
echo "✅ If both requests above work, your production environment is ready!"
echo "🔗 Go to the frontend URL and try the Slack OAuth flow."
