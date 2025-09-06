import { Router } from 'express';
const router = Router();

// TODO: Implement review routes
router.get('/', (req, res) => {
  res.json({ message: 'Reviews endpoint - TODO' });
});

export default router;