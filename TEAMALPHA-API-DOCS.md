# TeamAlpha Slack Integration API

## Overview
Direct integration with TeamAlpha Slack workspace using webhook for reliable message delivery without OAuth complexity.

## Base URL
- **Local Development**: `http://localhost:3001/api`
- **Production**: `https://slackconnectbackendv1.onrender.com/api`

## Webhook Endpoints (No Authentication Required)

### 1. Send Immediate Message
**Endpoint**: `POST /messages/webhook/send`

**Request Body**:
```json
{
  "message": "Your message text here"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Message sent successfully to TeamAlpha workspace"
}
```

**Example**:
```bash
curl -X POST http://localhost:3001/api/messages/webhook/send \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello TeamAlpha! 🚀"}'
```

### 2. Schedule Message
**Endpoint**: `POST /messages/webhook/schedule`

**Request Body**:
```json
{
  "message": "Your scheduled message",
  "scheduled_for": 1691520000
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "channel_name": "TeamAlpha Workspace",
    "message": "Your scheduled message",
    "scheduled_for": 1691520000,
    "status": "pending"
  },
  "message": "Message scheduled successfully for TeamAlpha workspace"
}
```

**Example**:
```bash
# Schedule message for 1 hour from now
TIMESTAMP=$(date -d "+1 hour" +%s)
curl -X POST http://localhost:3001/api/messages/webhook/schedule \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Scheduled reminder!\", \"scheduled_for\": $TIMESTAMP}"
```

## Test Endpoint

### Test Webhook (Original)
**Endpoint**: `POST /test/webhook`

**Request Body**:
```json
{
  "webhook_url": "https://hooks.slack.com/services/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",
  "message": "Test message"
}
```

## Message Formatting

### Slack Markdown Support
- **Bold**: `*bold text*`
- **Italic**: `_italic text_`
- **Code**: \`code\`
- **Code block**: \`\`\`code block\`\`\`
- **Links**: `<https://example.com|Link Text>`
- **Line breaks**: Use `\n`

### Emojis
- `:rocket:` 🚀
- `:star:` ⭐
- `:warning:` ⚠️
- `:white_check_mark:` ✅
- `:x:` ❌

### Example Formatted Message
```json
{
  "message": "🚀 *Project Update*\n\n✅ Backend deployed successfully\n✅ All tests passing\n\n📊 Next steps:\n• Frontend deployment\n• User testing\n\n_Great work team!_ 🎉"
}
```

## Scheduling

### Time Format
- Use Unix timestamp (seconds since epoch)
- JavaScript: `Math.floor(Date.now() / 1000) + 3600` (1 hour from now)
- Python: `int(time.time()) + 3600`
- PowerShell: `[DateTimeOffset]::Now.AddHours(1).ToUnixTimeSeconds()`

### Scheduling Examples

#### PowerShell
```powershell
# Schedule for 5 minutes from now
$timestamp = [DateTimeOffset]::Now.AddMinutes(5).ToUnixTimeSeconds()
$body = @{
    message = "Reminder: Team meeting in 5 minutes!"
    scheduled_for = $timestamp
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/messages/webhook/schedule" -Method POST -Body $body -ContentType "application/json"
```

#### JavaScript
```javascript
// Schedule for 1 hour from now
const timestamp = Math.floor(Date.now() / 1000) + 3600;
const response = await fetch('http://localhost:3001/api/messages/webhook/schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Daily standup reminder!',
    scheduled_for: timestamp
  })
});
```

## Use Cases

### 1. Daily Reminders
```json
{
  "message": "🌅 Good morning TeamAlpha!\n\nDaily standup starts in 15 minutes.\n\n📋 Don't forget to prepare:\n• What you did yesterday\n• What you plan to do today\n• Any blockers",
  "scheduled_for": 1691518800
}
```

### 2. Deployment Notifications
```json
{
  "message": "🚀 *Deployment Complete*\n\n✅ Backend v1.2.0 deployed successfully\n✅ All health checks passing\n\n🔗 <https://slackconnectbackendv1.onrender.com|Live URL>\n\n_Deployed by: DevOps Bot_"
}
```

### 3. Alert Messages
```json
{
  "message": "🔔 *ALERT*\n\n⚠️ High CPU usage detected on production server\n\n📊 Current usage: 87%\n⏰ Started: $(date)\n\n🔍 Please investigate immediately"
}
```

## Status Codes
- `200` - Success
- `400` - Bad Request (missing required fields)
- `500` - Internal Server Error

## Error Response Format
```json
{
  "success": false,
  "error": "Error description here"
}
```

## Workspace Information
- **Workspace**: `teamalpha-hbb8309.slack.com`
- **Webhook URL**: `https://hooks.slack.com/services/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`
- **Integration**: Direct webhook (no OAuth required)
- **Channel**: Default channel configured in webhook
