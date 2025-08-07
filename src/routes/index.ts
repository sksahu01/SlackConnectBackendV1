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

export default router;
