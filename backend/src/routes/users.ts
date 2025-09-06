import { Router } from 'express';
const router = Router();

// TODO: Implement user routes
router.get('/profile', (req, res) => {
  res.json({ message: 'User profile endpoint - TODO' });
});

export default router;