#!/bin/bash

# Test script for sending messages to TeamAlpha Slack workspace
# Webhook URL: https://hooks.slack.com/services/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

echo "🧪 Testing Slack Webhook for TeamAlpha workspace"
echo "================================================="

WEBHOOK_URL="https://hooks.slack.com/services/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"
API_URL="http://localhost:3001/api/test/webhook"

echo ""
echo "📤 Sending test message..."

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"webhook_url\": \"$WEBHOOK_URL\",
    \"message\": \"🚀 Hello from Slack Connect Backend! Testing message at $(date)\"
  }"

echo ""
echo ""
echo "✅ Message sent! Check your TeamAlpha Slack workspace."
echo ""
echo "🔗 Webhook URL: $WEBHOOK_URL"
echo "🏢 Workspace: teamalpha-hbb8309.slack.com"
