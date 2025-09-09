import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import {
  getPersonalizedRecommendations,
  getTrendingRecommendations,
} from '../controllers/recommendations';

const router = Router();

// Validation rules
const recommendationRules = [
  { field: 'limit', type: 'number' as const, required: false, min: 1, max: 20 },
  { field: 'type', type: 'string' as const, required: false, pattern: /^(similar|trending|category|mixed)$/ },
];

// Public routes (no authentication required)
router.get('/trending', validateRequest(recommendationRules), getTrendingRecommendations);

// Protected routes (authentication required for personalized recommendations)
router.use(authenticate);
router.get('/personalized', validateRequest(recommendationRules), getPersonalizedRecommendations);

export default router;