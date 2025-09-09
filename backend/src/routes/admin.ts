import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares';
import {
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getAllVendors,
  getAllUsers,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  getAllProducts,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  updateProductStatus,
} from '../controllers/admin';

const router = Router();

// Apply authentication and admin role requirement to all admin routes
router.use(authenticate);
router.use(requireRole('admin', 'super_admin'));

// Vendor management routes
router.get('/vendors/pending', getPendingVendors);
router.get('/vendors', getAllVendors);
router.put('/vendors/:vendorId/approve', approveVendor);
router.put('/vendors/:vendorId/reject', rejectVendor);

// User management routes
router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/deactivate', deactivateUser);
router.put('/users/:userId/reactivate', reactivateUser);

// Product management routes
router.get('/products', getAllProducts);
router.get('/products/pending', getPendingProducts);
router.put('/products/:productId/approve', approveProduct);
router.put('/products/:productId/reject', rejectProduct);
router.put('/products/:productId/status', updateProductStatus);

export default router;