import { Router } from 'express';
const router = Router();

// TODO: Implement order routes
router.get('/', (req, res) => {
  res.json({ message: 'Orders endpoint - TODO' });
});

export default router;