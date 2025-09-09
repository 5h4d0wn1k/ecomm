import { Router } from 'express';
import { authenticate } from '../middlewares';
import {
  getRevenueData,
  getProductPerformance,
  getVendorRevenueData,
  getVendorProductPerformance,
} from '../controllers/analytics';

const router = Router();

// Apply authentication to all analytics routes
router.use(authenticate);

// General analytics routes (admin level)
router.get('/revenue', getRevenueData);
router.get('/products/performance', getProductPerformance);

// Vendor-specific analytics routes
router.get('/vendor/revenue', getVendorRevenueData);
router.get('/vendor/products/performance', getVendorProductPerformance);

export default router;