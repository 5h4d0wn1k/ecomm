import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoryTree,
  updateCategory,
  deleteCategory,
} from '../controllers/categories';

const router = Router();

// Validation rules for category creation
const createCategoryRules = [
  { field: 'name', type: 'string' as const, required: true, minLength: 2, maxLength: 100 },
  { field: 'description', type: 'string' as const, required: false, maxLength: 500 },
  { field: 'parentId', type: 'number' as const, required: false, min: 1 },
  { field: 'imageUrl', type: 'string' as const, required: false },
  { field: 'sortOrder', type: 'number' as const, required: false, min: 0 },
];

// Validation rules for category update
const updateCategoryRules = [
  { field: 'name', type: 'string' as const, required: false, minLength: 2, maxLength: 100 },
  { field: 'description', type: 'string' as const, required: false, maxLength: 500 },
  { field: 'parentId', type: 'number' as const, required: false, min: 1 },
  { field: 'imageUrl', type: 'string' as const, required: false },
  { field: 'sortOrder', type: 'number' as const, required: false, min: 0 },
  { field: 'isActive', type: 'boolean' as const, required: false },
];

// Public routes (no authentication required)
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategoryById);

// Protected routes (authentication required)
router.use(authenticate);

// Admin only routes
router.post('/', requireRole('admin'), validateRequest(createCategoryRules), createCategory);
router.put('/:id', requireRole('admin'), validateRequest(updateCategoryRules), updateCategory);
router.delete('/:id', requireRole('admin'), deleteCategory);

export default router;