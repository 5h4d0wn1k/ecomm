import { Router } from 'express';
import { authenticate } from '../middlewares';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notifications';

const router = Router();

// Apply authentication to all notification routes
router.use(authenticate);

// Notification routes
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);

export default router;