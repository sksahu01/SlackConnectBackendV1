#!/bin/bash

# Test script for Slack webhook functionality

echo "🧪 Testing Slack Webhook Integration"
echo "====================================="

WEBHOOK_URL="https://hooks.slack.com/services/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"
BACKEND_URL="https://slackconnectbackendv1.onrender.com"

echo ""
echo "1. Testing direct webhook call..."
curl -X POST \
  -H 'Content-type: application/json' \
  --data '{"text":"🎉 Direct webhook test from Slack Connect Backend!"}' \
  $WEBHOOK_URL

echo ""
echo ""
echo "2. Testing backend webhook endpoint..."
curl -X POST \
  $BACKEND_URL/api/test/webhook \
  -H 'Content-Type: application/json' \
  -d "{
    \"webhook_url\": \"$WEBHOOK_URL\",
    \"message\": \"🚀 Backend webhook test successful! OAuth integration working.\"
  }"

echo ""
echo ""
echo "3. Testing backend health..."
curl $BACKEND_URL/api/health

echo ""
echo ""
echo "4. Testing backend configuration..."
curl $BACKEND_URL/api/debug/config

echo ""
echo ""
echo "✅ Test complete! Check your Slack channel for messages."
