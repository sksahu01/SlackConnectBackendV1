# 🔧 URGENT: Fix Slack Connection Issues

## ❌ Current Issue
Your Slack connection is failing. Here's what to check and fix:

## 🔍 Step 1: Verify Slack App Configuration

Go to [Slack API Apps](https://api.slack.com/apps) and check:

### A. OAuth & Permissions
1. **Redirect URLs** should have EXACTLY:
   ```
   https://slackconnectbackendv1.onrender.com/api/auth/callback
   ```
   - Remove any localhost URLs for production
   - Make sure there are NO extra spaces or characters

### B. Scopes (Bot Token Scopes)
Make sure you have these scopes:
- `channels:read`
- `chat:write`
- `users:read`

### C. App Credentials
Copy these from your Slack app:
- **Client ID**: From "Basic Information" → "App Credentials"
- **Client Secret**: From "Basic Information" → "App Credentials"

## 🔧 Step 2: Set Render Environment Variables

In your Render dashboard, set these **exact** values:

```env
SLACK_CLIENT_ID=9312608562228.9307418825971
SLACK_CLIENT_SECRET=48f6f8c4b978f917a561a4f7598f041b
```

⚠️ **IMPORTANT**: These should be set in Render dashboard, NOT in your `.env.production` file!

## 🧪 Step 3: Test the Connection

### Test Backend Health:
```bash
curl https://slackconnectbackendv1.onrender.com/api/health
```

### Test Auth Initiation:
```bash
curl https://slackconnectbackendv1.onrender.com/api/auth/slack
```
Should return:
```json
{
  "success": true,
  "data": {
    "auth_url": "https://slack.com/oauth/v2/authorize?...",
    "state": "some-random-string"
  }
}
```

## 🐛 Step 4: Check Logs

In Render dashboard:
1. Go to your service
2. Click "Logs"
3. Look for any error messages about missing environment variables

## 🔄 Step 5: Common Issues & Solutions

### Issue: "Missing required Slack configuration"
**Solution**: Environment variables not set in Render

### Issue: "invalid_client_id" or "invalid_client_secret"
**Solution**: Wrong credentials in Render environment variables

### Issue: "redirect_uri_mismatch"
**Solution**: Slack app redirect URL doesn't match your backend URL

### Issue: CORS errors
**Solution**: Frontend URL mismatch

## ✅ Step 6: Verify Frontend Integration

Your frontend should call:
```javascript
// Get auth URL
fetch('https://slackconnectbackendv1.onrender.com/api/auth/slack')

// The backend will handle the callback automatically
```

---

## 🚨 Quick Fix Checklist:

- [ ] Slack app redirect URL: `https://slackconnectbackendv1.onrender.com/api/auth/callback`
- [ ] Render environment variables set correctly
- [ ] Backend health check works
- [ ] Auth endpoint returns auth_url
- [ ] Frontend points to correct backend URL

Let me know which step reveals the issue!
