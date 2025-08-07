# Local Testing Setup

## Current Issue
Your Slack app is configured for production URLs, but you're testing locally.

## Your Current Slack App Settings
- **Client ID**: 9312608562228.9307418825971
- **Redirect URL**: https://slackconnectbackendv1.onrender.com/api/auth/callback (Production)
- **Local Server**: http://localhost:3001/api/auth/callback

## To Test Locally

### Option 1: Use Production Environment (Recommended)
1. Go to: https://slackconnectfrontendv1.netlify.app
2. Test the OAuth flow there
3. Check logs at: https://slackconnectbackendv1.onrender.com/api/debug/config

### Option 2: Create Development Slack App
1. Go to https://api.slack.com/apps
2. Create a new app for development
3. Set redirect URL to: `http://localhost:3001/api/auth/callback`
4. Update your `.env` file with the new dev app credentials

### Option 3: Add Local Redirect to Existing App
1. Go to https://api.slack.com/apps/A07HJ8ZLF5K
2. Go to "OAuth & Permissions"
3. Add redirect URL: `http://localhost:3001/api/auth/callback`
4. Keep both production and local URLs

## Current Status
- ✅ Server running on localhost:3001
- ✅ Environment variables loaded
- ✅ All services initialized
- ❌ OAuth callback URL mismatch

## Test Production Now
Your production environment should work. Test it at:
https://slackconnectfrontendv1.netlify.app
