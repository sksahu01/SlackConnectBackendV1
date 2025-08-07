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

**Your URLs:**
- Backend: `https://slackconnectbackendv1.onrender.com`
- Frontend: `https://slackconnectfrontendv1.netlify.app`

### 3. Environment Variables
Set these environment variables in Render dashboard:

**Required:**
- `NODE_ENV`: `production`
- `SLACK_CLIENT_ID`: Your Slack app client ID
- `SLACK_CLIENT_SECRET`: Your Slack app client secret
- `SLACK_REDIRECT_URI`: `https://slackconnectbackendv1.onrender.com/api/auth/callback`
- `FRONTEND_URL`: `https://slackconnectfrontendv1.netlify.app`
- `JWT_SECRET`: Let Render auto-generate this
- `JWT_EXPIRES_IN`: `7d`
- `DATABASE_PATH`: `/opt/render/project/src/data/slack_connect.db`
- `LOG_LEVEL`: `info`

### 4. Slack App Configuration
Update your Slack app settings:
1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Select your app
3. Update **OAuth & Permissions** → **Redirect URLs**:
   - Add: `https://slackconnectbackendv1.onrender.com/api/auth/callback`
4. Update **Event Subscriptions** (if used):
   - Request URL: `https://slackconnectbackendv1.onrender.com/api/webhooks/slack`

### 5. Health Check
The app includes a health check endpoint at `/api/health` which Render will use to monitor the service.

### 6. Database
The app uses SQLite with better-sqlite3. The database will be stored in the persistent `/opt/render/project/src/data/` directory.

### 7. CORS Configuration
The app is configured to accept requests from your `FRONTEND_URL`. Make sure to set this correctly.

## Post-Deployment
1. Test the health endpoint: `https://slackconnectbackendv1.onrender.com/api/health`
2. Test the OAuth flow with your frontend at `https://slackconnectfrontendv1.netlify.app`
3. Monitor logs in Render dashboard

## Important Configuration Steps

### Step 1: Update Your Slack App
1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Select your app
3. Go to **OAuth & Permissions**
4. Under **Redirect URLs**, add: `https://slackconnectbackendv1.onrender.com/api/auth/callback`
5. Save changes

### Step 2: Set Environment Variables in Render
Make sure these are set in your Render dashboard:
- `FRONTEND_URL`: `https://slackconnectfrontendv1.netlify.app`
- `SLACK_REDIRECT_URI`: `https://slackconnectbackendv1.onrender.com/api/auth/callback`

### Step 3: Test the Integration
1. Visit your frontend: `https://slackconnectfrontendv1.netlify.app`
2. Try the Slack OAuth flow
3. Check that API calls work between frontend and backend

## Troubleshooting
- Check logs in Render dashboard for any startup issues
- Ensure all environment variables are set correctly
- Verify Slack app redirect URLs match your deployed URL
