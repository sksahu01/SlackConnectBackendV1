import { Router } from 'express';
import AuthController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// OAuth routes
router.get('/slack', authController.initiateSlackAuth);
router.get('/callback', authController.handleSlackCallback);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/refresh', authenticateToken, authController.refreshTokenStatus);
router.post('/logout', authenticateToken, authController.logout);

export default router;
