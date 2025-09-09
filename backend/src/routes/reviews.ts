import { Router } from 'express';
import { authenticate } from '../middlewares';
import { getProductReviews, createProductReview } from '../controllers/reviews';

const router = Router();

// Public routes
router.get('/products/:id/reviews', getProductReviews);

// Protected routes
router.post('/products/:id/reviews', authenticate, createProductReview);

export default router;