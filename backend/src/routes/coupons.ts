import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares';
import { validateCoupon, createCoupon } from '../controllers/coupons';

const router = Router();

// Public routes
router.get('/validate', validateCoupon);

// Protected routes (Admin only)
router.post('/', authenticate, requireRole('admin', 'super_admin'), createCoupon);

export default router;