import { Router } from 'express';
import { authenticate } from '../middlewares';
import {
  getVendorProfile,
  updateVendorProfile,
  getVendorDashboard,
  getVendorProducts,
  getVendorOrders,
  getVendorEarnings,
  getVendorOrderStats,
} from '../controllers/vendors';

const router = Router();

// Apply authentication to all vendor routes
router.use(authenticate);

// Profile routes
router.get('/profile', getVendorProfile);
router.put('/profile', updateVendorProfile);

// Dashboard routes
router.get('/dashboard', getVendorDashboard);

// Product routes
router.get('/products', getVendorProducts);

// Order routes
router.get('/orders', getVendorOrders);

// Earnings routes
router.get('/earnings', getVendorEarnings);

// Order stats routes
router.get('/order-stats', getVendorOrderStats);

export default router;