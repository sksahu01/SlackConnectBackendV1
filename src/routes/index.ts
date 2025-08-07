import { Router } from 'express';
import authRoutes from './auth';
import messageRoutes from './messages';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Debug endpoint to check configuration (remove in production)
router.get('/debug/config', (req, res) => {
  res.json({
    success: true,
    data: {
      env: process.env.NODE_ENV,
      frontend_url: process.env.FRONTEND_URL,
      slack_redirect_uri: process.env.SLACK_REDIRECT_URI,
      slack_client_id_present: !!process.env.SLACK_CLIENT_ID,
      slack_client_secret_present: !!process.env.SLACK_CLIENT_SECRET,
      jwt_secret_present: !!process.env.JWT_SECRET,
      database_path: process.env.DATABASE_PATH
    }
  });
});

// Test webhook endpoint
router.post('/test/webhook', async (req, res) => {
  try {
    const { webhook_url, message } = req.body;

    if (!webhook_url || !message) {
      return res.status(400).json({
        success: false,
        error: 'webhook_url and message are required'
      });
    }

    // Import SlackService dynamically to avoid circular dependency
    const SlackService = (await import('../services/slackService')).default;
    const slackService = new SlackService();

    await slackService.sendWebhookMessage(webhook_url, message);

    res.json({
      success: true,
      message: 'Webhook message sent successfully'
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send webhook message'
    });
  }
});

export default router;
