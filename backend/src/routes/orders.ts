import { Router } from 'express';
import { authenticate, validateRequest, createOrderRules, updateOrderStatusRules } from '../middlewares';
import { getOrders, getOrderById, createOrder, updateOrderStatus } from '../controllers/orders';
import { createOrderSchema, updateOrderStatusSchema } from '../validations';

const router = Router();

// Apply authentication to all order routes
router.use(authenticate);

// User routes
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', validateRequest(createOrderRules), createOrder);

// Admin/Vendor routes
router.put('/:id/status', validateRequest(updateOrderStatusRules), updateOrderStatus);

export default router;