import { Router } from 'express';
const router = Router();

// TODO: Implement payment routes
router.get('/', (req, res) => {
  res.json({ message: 'Payments endpoint - TODO' });
});

export default router;