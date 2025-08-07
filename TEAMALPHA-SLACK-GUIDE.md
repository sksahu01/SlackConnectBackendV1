# TeamAlpha Slack Workspace Integration Guide

## Your Webhook Configuration
- **Workspace**: teamalpha-hbb8309.slack.com
- **Webhook URL**: `https://hooks.slack.com/services/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`
- **Status**: ✅ **WORKING** - Messages have been successfully sent!

## 1. Send Immediate Messages

### Using the Test Endpoint (Local Development)
```bash
# PowerShell
$body = @{
    webhook_url = "https://hooks.slack.com/services/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"
    message = "Your message here"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/test/webhook" -Method POST -Body $body -ContentType "application/json"
```

### Using Production API
```bash
# PowerShell
$body = @{
    webhook_url = "https://hooks.slack.com/services/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"
    message = "Your message here"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://slackconnectbackendv1.onrender.com/api/test/webhook" -Method POST -Body $body -ContentType "application/json"
```

## 2. Schedule Messages

To schedule messages, you'll need to:
1. Complete the OAuth flow first (to get authenticated)
2. Use the scheduled messages API

### Step 1: Authenticate via OAuth
Go to: https://slackconnectfrontendv1.netlify.app and complete the Slack OAuth

### Step 2: Schedule a Message
```bash
# After OAuth, you'll get a JWT token
$headers = @{
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    channel_id = "C1234567890"  # Your channel ID
    channel_name = "general"    # Channel name
    message = "This is a scheduled message!"
    scheduled_for = 1691520000  # Unix timestamp for when to send
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/messages/schedule" -Method POST -Body $body -Headers $headers
```

## 3. Example Use Cases

### Daily Standup Reminder
```powershell
$body = @{
    webhook_url = "https://hooks.slack.com/services/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"
    message = "🌅 Good morning TeamAlpha! Don't forget about today's standup at 9 AM."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/test/webhook" -Method POST -Body $body -ContentType "application/json"
```

### Project Updates
```powershell
$body = @{
    webhook_url = "https://hooks.slack.com/services/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"
    message = "📊 **Project Update**: Backend deployment successful! All systems are running smoothly. 🚀"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/test/webhook" -Method POST -Body $body -ContentType "application/json"
```

### Alert Messages
```powershell
$body = @{
    webhook_url = "https://hooks.slack.com/services/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"
    message = "🔔 **ALERT**: Server response time is higher than usual. Please check the logs."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/test/webhook" -Method POST -Body $body -ContentType "application/json"
```

## 4. API Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/test/webhook` | POST | Send immediate webhook message | No |
| `/api/messages/send` | POST | Send immediate message (OAuth) | Yes |
| `/api/messages/schedule` | POST | Schedule a message | Yes |
| `/api/messages/scheduled` | GET | List scheduled messages | Yes |
| `/api/auth/slack` | GET | Start OAuth flow | No |

## 5. Message Formatting

You can use Slack's markdown formatting:
- **Bold**: `*bold text*`
- _Italic_: `_italic text_`
- `Code`: \`code\`
- Links: `<https://example.com|Link Text>`
- Mentions: `<@USER_ID>` or `<!channel>`
- Emojis: `:rocket:` `:star:` `:warning:`

## 6. Testing Commands

Quick test messages you can run right now:

```powershell
# Test 1: Simple message
$body = @{ webhook_url = "https://hooks.slack.com/services/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"; message = "✅ Test message from Slack Connect!" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/test/webhook" -Method POST -Body $body -ContentType "application/json"

# Test 2: Formatted message
$body = @{ webhook_url = "https://hooks.slack.com/services/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"; message = "🚀 *Slack Connect Backend* is working!\n\n✅ Webhook integration active\n✅ Message scheduling ready\n✅ OAuth flow configured" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/test/webhook" -Method POST -Body $body -ContentType "application/json"
```

## Status: ✅ READY TO USE!
Your TeamAlpha Slack integration is fully configured and working!
