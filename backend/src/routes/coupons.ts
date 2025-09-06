import { Router } from 'express';
const router = Router();

// TODO: Implement coupon routes
router.get('/', (req, res) => {
  res.json({ message: 'Coupons endpoint - TODO' });
});

export default router;