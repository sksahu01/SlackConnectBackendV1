# Slack Connect Backend - Render Deployment Guide

## Deployment Steps

### 1. Prepare Your Repository
- Ensure your code is pushed to GitHub/GitLab
- Make sure all changes are committed

### 2. Create Render Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure the following settings:

**Basic Settings:**
- Name: `slack-connect-backend`
- Environment: `Node`
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`

### 3. Environment Variables
Set these environment variables in Render dashboard:

**Required:**
- `NODE_ENV`: `production`
- `SLACK_CLIENT_ID`: Your Slack app client ID
- `SLACK_CLIENT_SECRET`: Your Slack app client secret
- `SLACK_REDIRECT_URI`: `https://your-app-name.onrender.com/api/auth/callback`
- `FRONTEND_URL`: Your frontend app URL
- `JWT_SECRET`: Let Render auto-generate this
- `JWT_EXPIRES_IN`: `7d`
- `DATABASE_PATH`: `/opt/render/project/src/data/slack_connect.db`
- `LOG_LEVEL`: `info`

### 4. Slack App Configuration
Update your Slack app settings:
1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Select your app
3. Update **OAuth & Permissions** → **Redirect URLs**:
   - Add: `https://your-app-name.onrender.com/api/auth/callback`
4. Update **Event Subscriptions** (if used):
   - Request URL: `https://your-app-name.onrender.com/api/webhooks/slack`

### 5. Health Check
The app includes a health check endpoint at `/api/health` which Render will use to monitor the service.

### 6. Database
The app uses SQLite with better-sqlite3. The database will be stored in the persistent `/opt/render/project/src/data/` directory.

### 7. CORS Configuration
The app is configured to accept requests from your `FRONTEND_URL`. Make sure to set this correctly.

## Post-Deployment
1. Test the health endpoint: `https://your-app-name.onrender.com/api/health`
2. Test the OAuth flow with your frontend
3. Monitor logs in Render dashboard

## Troubleshooting
- Check logs in Render dashboard for any startup issues
- Ensure all environment variables are set correctly
- Verify Slack app redirect URLs match your deployed URL
