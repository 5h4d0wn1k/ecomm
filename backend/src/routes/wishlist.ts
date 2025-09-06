import { Router } from 'express';
const router = Router();

// TODO: Implement wishlist routes
router.get('/', (req, res) => {
  res.json({ message: 'Wishlist endpoint - TODO' });
});

export default router;