# 🔧 SLACK APP CONFIGURATION FIX

## ❌ Current Problem
OAuth callback is failing with `invalid_code` and `invalid_auth` errors.

## 🎯 Root Cause
The Slack app configuration doesn't match the OAuth implementation requirements.

## ✅ EXACT Steps to Fix Your Slack App

### 1. Go to Your Slack App
Visit: https://api.slack.com/apps/A07NH6WTE16

### 2. OAuth & Permissions Settings

#### A. Redirect URLs
**Remove all existing URLs and add ONLY:**
```
https://slackconnectbackendv1.onrender.com/api/auth/callback
```

#### B. Bot Token Scopes
Add these scopes:
- `channels:read`
- `chat:write`
- `users:read`
- `users:read.email`

#### C. User Token Scopes
Add these scopes:
- `identify`
- `email`

### 3. App Manifest (Alternative Approach)
If you prefer, you can use this manifest to configure everything at once:

```yaml
display_information:
  name: Slack Connect
  description: Connect and schedule Slack messages
  background_color: "#2c2d30"
features:
  bot_user:
    display_name: Slack Connect Bot
    always_online: false
  slash_commands: []
oauth_config:
  redirect_urls:
    - https://slackconnectbackendv1.onrender.com/api/auth/callback
  scopes:
    bot:
      - channels:read
      - chat:write
      - users:read
      - users:read.email
    user:
      - identify
      - email
settings:
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false
```

### 4. Environment Variables Check

Make sure these are set in Render:
```env
SLACK_CLIENT_ID=9312608562228.9307418825971
SLACK_CLIENT_SECRET=your_actual_client_secret
SLACK_REDIRECT_URI=https://slackconnectbackendv1.onrender.com/api/auth/callback
```

### 5. Test the Fix

#### A. Check Configuration
```bash
curl https://slackconnectbackendv1.onrender.com/api/debug/config
```

#### B. Test Auth Flow
1. Go to: https://slackconnectfrontendv1.netlify.app
2. Click "Connect to Slack"
3. Should redirect to Slack OAuth page
4. After authorization, should redirect back with success

### 6. Troubleshooting Commands

#### Check if backend is working:
```bash
curl https://slackconnectbackendv1.onrender.com/api/health
```

#### Get auth URL:
```bash
curl https://slackconnectbackendv1.onrender.com/api/auth/slack
```

### 7. Key Changes Made in Code

1. **Fixed OAuth token exchange**: Now uses proper URL encoding
2. **Fixed user info retrieval**: Uses `auth.test` first to get user ID
3. **Enhanced logging**: Shows exactly what's happening in each step
4. **Improved scopes**: Added necessary user token scopes

### 8. Expected Flow After Fix

1. User clicks "Connect to Slack" on frontend
2. Backend generates auth URL with correct scopes
3. User authorizes on Slack
4. Slack redirects to `/api/auth/callback` with code
5. Backend exchanges code for tokens
6. Backend gets user info using user token
7. Backend creates/updates user in database
8. Backend generates JWT token
9. Backend redirects to frontend with success token

---

## 🚨 MOST IMPORTANT

The main issue was using the wrong scopes and token types. Make sure:

1. ✅ Redirect URL is EXACTLY: `https://slackconnectbackendv1.onrender.com/api/auth/callback`
2. ✅ User token scopes include `identify` and `email`
3. ✅ Bot token scopes include `users:read` and `users:read.email`

After making these changes, reinstall the app to your workspace if prompted!
