import { Router } from 'express';
const router = Router();

// TODO: Implement upload routes
router.get('/', (req, res) => {
  res.json({ message: 'Uploads endpoint - TODO' });
});

export default router;