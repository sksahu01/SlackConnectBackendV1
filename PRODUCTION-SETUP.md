# Slack Connect Backend - Production Configuration

## Your Deployment URLs
- **Frontend**: https://slackconnectfrontendv1.netlify.app
- **Backend**: https://slackconnectbackendv1.onrender.com

## Required Render Environment Variables

Copy and paste these exact values into your Render dashboard:

```
NODE_ENV=production
FRONTEND_URL=https://slackconnectfrontendv1.netlify.app
SLACK_REDIRECT_URI=https://slackconnectbackendv1.onrender.com/api/auth/callback
JWT_EXPIRES_IN=7d
DATABASE_PATH=/opt/render/project/src/data/slack_connect.db
LOG_LEVEL=info
```

**Plus these from your Slack app:**
```
SLACK_CLIENT_ID=your_actual_slack_client_id
SLACK_CLIENT_SECRET=your_actual_slack_client_secret
```

## Slack App Configuration
In your Slack app settings (https://api.slack.com/apps):

1. **OAuth & Permissions** → **Redirect URLs**:
   - Add: `https://slackconnectbackendv1.onrender.com/api/auth/callback`

2. **Basic Information** → **App Credentials**:
   - Copy `Client ID` → Set as `SLACK_CLIENT_ID` in Render
   - Copy `Client Secret` → Set as `SLACK_CLIENT_SECRET` in Render

## Test URLs
- Health Check: https://slackconnectbackendv1.onrender.com/api/health
- Frontend App: https://slackconnectfrontendv1.netlify.app

## Quick Verification
1. Visit: https://slackconnectbackendv1.onrender.com/api/health
2. Should return: `{"success": true, "message": "Server is running", ...}`
3. CORS should allow requests from Netlify frontend
