import { Router } from 'express';
const router = Router();

// TODO: Implement vendor routes
router.get('/', (req, res) => {
  res.json({ message: 'Vendors endpoint - TODO' });
});

export default router;