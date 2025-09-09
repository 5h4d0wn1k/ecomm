import { Router } from 'express';
import { authenticate } from '../middlewares';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist';

const router = Router();

// Apply authentication to all wishlist routes
router.use(authenticate);

// Wishlist routes
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;