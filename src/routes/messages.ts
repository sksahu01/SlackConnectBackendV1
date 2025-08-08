import { Router } from 'express';
import MessageController from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();
const messageController = new MessageController();

// Webhook routes (no authentication required)
router.post('/webhook/send', messageController.sendWebhookMessage);
router.post('/webhook/schedule', messageController.scheduleWebhookMessage);
router.get('/webhook/scheduled', messageController.getWebhookScheduledMessages);
router.delete('/webhook/scheduled/:id', messageController.cancelWebhookScheduledMessage);
router.put('/webhook/scheduled/:id', messageController.updateWebhookScheduledMessage);

// All other message routes require authentication
router.use(authenticateToken);

// Channel management
router.get('/channels', messageController.getChannels);
router.get('/debug/channels', messageController.debugChannels);

// Immediate messaging
router.post('/send', validate(schemas.sendMessage), messageController.sendMessage);

// Scheduled messaging
router.post('/schedule', validate(schemas.scheduleMessage), messageController.scheduleMessage);
router.get('/scheduled', messageController.getScheduledMessages);
router.delete('/scheduled/:id', messageController.cancelScheduledMessage);
router.put('/scheduled/:id', messageController.updateScheduledMessage);

export default router;
