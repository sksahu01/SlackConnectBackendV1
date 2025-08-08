# SlackConnect Backend V1

A comprehensive Node.js backend application for Slack workspace integration, featuring OAuth authentication, real-time messaging, and advanced scheduled message management.

## 🚀 Features

- **Slack OAuth 2.0 Integration**: Secure authentication with user and bot token management
- **Real-time Messaging**: Send instant messages to any Slack channel
- **Scheduled Messages**: Create, update, and cancel scheduled messages with precision timing
- **Webhook Support**: External integrations for automated messaging workflows
- **Channel Discovery**: Access both public and private channels with comprehensive fallback strategies
- **Token Management**: Secure JWT-based session handling
- **Production Ready**: Configured for Render deployment with environment-based configurations

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Setup Instructions](#setup-instructions)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Challenges & Learnings](#challenges--learnings)
- [Contributing](#contributing)

## 🏗 Architecture Overview

### System Design

The application follows a modular Node.js architecture with TypeScript, designed for scalability and maintainability:

```
├── src/
│   ├── controllers/     # Request handling and business logic coordination
│   ├── services/        # Core business logic (Slack API, Auth, Scheduling)
│   ├── models/          # Data models and database schemas
│   ├── routes/          # API endpoint definitions
│   ├── middleware/      # Authentication, validation, and error handling
│   └── utils/           # Helper functions and utilities
├── database/            # SQLite database files
└── dist/               # Compiled TypeScript output
```

### Key Components

#### 1. **OAuth Flow & Token Management**
- **Dual Token Strategy**: Manages both user tokens (for identity) and bot tokens (for API operations)
- **Scope Management**: Comprehensive scopes including `channels:read`, `groups:read`, `chat:write`, `users:read`, `incoming-webhook`
- **Session Security**: JWT-based authentication with secure token storage
- **Automatic Refresh**: Handles token expiration and refresh workflows

#### 2. **Slack Service Integration**
- **Multi-Strategy Channel Discovery**: 
  - Primary: `conversations.list` for all channels
  - Fallback: Public channels only via `conversations.list`
  - Final fallback: User's accessible channels via `users.conversations`
- **Robust Error Handling**: Multiple retry mechanisms and graceful degradation
- **Channel Deduplication**: Intelligent filtering to prevent duplicate channels

#### 3. **Scheduled Task Management**
- **Node-Cron Integration**: Precise scheduling with cron expressions
- **Database Persistence**: SQLite storage for scheduled message metadata
- **Dynamic Task Management**: Runtime creation, modification, and cancellation of scheduled tasks
- **Status Tracking**: Complete lifecycle monitoring from creation to execution

#### 4. **Webhook Architecture**
- **Authentication-Free Endpoints**: External system integration without user authentication
- **Unified Message Interface**: Same underlying service for both authenticated and webhook messages
- **Environment-Based Configuration**: Webhook URLs managed through environment variables

## 🛠 Setup Instructions

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Latest version
- **Slack App**: Configured with appropriate OAuth scopes
- **Git**: For version control

### 1. Clone the Repository

```bash
git clone https://github.com/sksahu01/SlackConnectBackendV1.git
cd SlackConnectBackendV1
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Slack App Configuration

#### Create a Slack App:
1. Visit [Slack API Apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app and select your workspace

#### Configure OAuth & Permissions:
1. Navigate to "OAuth & Permissions"
2. Add the following **Bot Token Scopes**:
   ```
   channels:read    - View basic information about public channels
   groups:read      - View basic information about private channels
   chat:write       - Send messages as your app
   users:read       - View people in the workspace
   incoming-webhook - Post messages to specific channels
   ```

3. Add the following **User Token Scopes**:
   ```
   identity.basic - View basic profile information
   identity.email - View email address
   identity.team  - View workspace name and domain
   ```

#### Set Redirect URLs:
```
http://localhost:3000/auth/slack/callback    # For local development
https://your-frontend-url.com/auth/callback  # For production
```

#### Enable Incoming Webhooks:
1. Navigate to "Incoming Webhooks"
2. Activate incoming webhooks
3. Add webhook to workspace if needed

### 4. Environment Configuration

Create environment files for different deployment stages:

#### `.env` (Local Development)
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Frontend URLs
FRONTEND_URL=http://localhost:3000

# Slack OAuth Configuration
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=http://localhost:3000/auth/slack/callback

# Webhook Configuration
SLACK_WEBHOOK_URL=https://your-domain.com/api/messages/webhook/send

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_for_development

# Database
DATABASE_PATH=./database/slack-connect.db
```

#### `.env.production` (Production)
```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Frontend URLs
FRONTEND_URL=https://slackconnectfrontendv1.netlify.app

# Slack OAuth Configuration
SLACK_CLIENT_ID=your_production_slack_client_id
SLACK_CLIENT_SECRET=your_production_slack_client_secret
SLACK_REDIRECT_URI=https://slackconnectfrontendv1.netlify.app/auth/callback

# Webhook Configuration
SLACK_WEBHOOK_URL=https://slack-connect-backend.onrender.com/api/messages/webhook/send

# JWT Configuration
JWT_SECRET=your_super_secure_production_jwt_secret

# Database
DATABASE_PATH=./database/slack-connect.db
```

## 🔧 Local Development

### Start Development Server

```bash
# Start in development mode with hot reload
npm run dev

# Or build and start production mode
npm run build
npm start
```

The server will start on `http://localhost:5000` (or your specified PORT).

### Database Initialization

The SQLite database is automatically created and initialized on first run. The database file will be created at `./database/slack-connect.db`.

### Development Workflow

1. **Start the backend**: `npm run dev`
2. **Start your frontend**: (Navigate to your frontend project and start it)
3. **Test OAuth Flow**: Visit your frontend and initiate Slack authentication
4. **Test API Endpoints**: Use the provided API documentation below

## 📚 API Documentation

### Authentication Endpoints

#### Initiate OAuth
```http
GET /api/auth/slack
```
Returns the Slack OAuth authorization URL.

#### Handle OAuth Callback
```http
GET /api/auth/slack/callback?code=...&state=...
```
Processes the OAuth callback and returns user tokens.

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### Message Endpoints

#### Get Channels
```http
GET /api/messages/channels
Authorization: Bearer <jwt_token>
```

#### Send Immediate Message
```http
POST /api/messages/send
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "channel": "general",
  "message": "Hello, Slack!",
  "username": "SlackBot"
}
```

#### Schedule Message
```http
POST /api/messages/schedule
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "channel": "general",
  "message": "Scheduled message",
  "scheduledTime": "2024-12-25T10:00:00Z",
  "username": "ScheduleBot"
}
```

#### Get Scheduled Messages
```http
GET /api/messages/scheduled
Authorization: Bearer <jwt_token>
```

#### Cancel Scheduled Message
```http
DELETE /api/messages/scheduled/{messageId}
Authorization: Bearer <jwt_token>
```

### Webhook Endpoints (No Authentication Required)

#### Send Webhook Message
```http
POST /api/messages/webhook/send
Content-Type: application/json

{
  "channel": "general",
  "message": "Webhook message",
  "username": "WebhookBot"
}
```

#### Schedule Webhook Message
```http
POST /api/messages/webhook/schedule
Content-Type: application/json

{
  "channel": "general",
  "message": "Scheduled webhook message",
  "scheduledTime": "2024-12-25T10:00:00Z",
  "username": "WebhookScheduler"
}
```

## 🚀 Deployment

### Render Deployment

The application is pre-configured for Render deployment with the included `render.yaml` file.

#### 1. Connect Repository
1. Fork this repository to your GitHub account
2. Connect your GitHub account to Render
3. Create a new Web Service and connect your forked repository

#### 2. Environment Variables
Configure the following environment variables in Render:

```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.netlify.app
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=https://your-frontend-url.netlify.app/auth/callback
SLACK_WEBHOOK_URL=https://your-backend-url.onrender.com/api/messages/webhook/send
JWT_SECRET=your_secure_jwt_secret
DATABASE_PATH=./database/slack-connect.db
```

#### 3. Deploy
Render will automatically build and deploy your application using the configuration in `render.yaml`.

### Frontend Integration

This backend is designed to work with the SlackConnect Frontend V1. Ensure your frontend is configured with the correct backend URL:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.onrender.com/api'
  : 'http://localhost:5000/api';
```

## 🔍 Challenges & Learnings

### 1. **Slack OAuth Complexity**

**Challenge**: Managing dual token types (user and bot tokens) with different scopes and permissions.

**Solution**: 
- Implemented a comprehensive token management system that handles both user and bot tokens
- Created fallback strategies for different permission levels
- Added detailed logging for OAuth debugging

**Learning**: Slack's OAuth v2 flow requires careful scope management. Bot tokens are essential for API operations, while user tokens provide identity context.

### 2. **Channel Discovery Limitations**

**Challenge**: Different Slack workspaces have varying permission structures, making it difficult to reliably fetch all accessible channels.

**Solution**:
- Implemented a multi-strategy approach:
  1. Primary: Attempt to fetch all channels (public + private)
  2. Fallback: Fetch public channels only
  3. Final fallback: Fetch user's accessible channels
- Added channel deduplication logic
- Implemented graceful degradation with default channel options

**Learning**: Slack permissions are workspace-dependent. A robust application must handle various permission scenarios gracefully.

### 3. **Scheduled Message Management**

**Challenge**: Node.js cron jobs are lost when the server restarts, making scheduled messages unreliable.

**Solution**:
- Implemented database persistence for scheduled messages
- Created a service that reconstructs cron jobs on server startup
- Added comprehensive status tracking and error handling
- Enabled dynamic job modification and cancellation

**Learning**: Persistent scheduling requires database state management and careful job lifecycle handling.

### 4. **Environment Configuration Complexity**

**Challenge**: Managing different configurations for development, staging, and production environments.

**Solution**:
- Created separate environment files (`.env`, `.env.production`)
- Implemented environment-specific configuration loading
- Added validation for required environment variables
- Documented all configuration options

**Learning**: Clear environment separation and validation prevent deployment issues and improve debugging.

### 5. **Error Handling & Debugging**

**Challenge**: Slack API errors can be cryptic, making debugging difficult.

**Solution**:
- Implemented comprehensive logging throughout the application
- Added specific error messages for common Slack API issues
- Created debug endpoints for troubleshooting
- Added graceful fallback mechanisms

**Learning**: Detailed logging and user-friendly error messages are crucial for maintaining Slack integrations.

### 6. **Webhook Security vs Accessibility**

**Challenge**: Balancing webhook accessibility for external integrations with security requirements.

**Solution**:
- Created separate webhook endpoints that bypass authentication
- Implemented rate limiting and validation for webhook endpoints
- Added environment-based webhook URL configuration
- Maintained security for user-facing endpoints

**Learning**: Webhooks require a different security model than user-facing APIs, but still need protection against abuse.

## 🔧 Technical Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT with bcryptjs
- **Scheduling**: node-cron
- **HTTP Client**: Axios
- **Validation**: Joi
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Development**: nodemon, ts-node

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

For issues and questions:
1. Check the [API Documentation](#api-documentation)
2. Review the [Challenges & Learnings](#challenges--learnings) section
3. Create an issue on GitHub

## 📄 License

This project is licensed under the ISC License.

---

**Built with ❤️ for seamless Slack workspace integration**
