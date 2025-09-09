import { Router } from 'express';
import { authenticate, requireRole, requireOwnership } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import {
  createProduct,
  getProducts,
  getProductById,
  getSearchSuggestions,
  updateProduct,
  deleteProduct,
  archiveProduct,
} from '../controllers/products';

const router = Router();

// Validation rules for product creation
const createProductRules = [
  { field: 'name', type: 'string' as const, required: true, minLength: 2, maxLength: 255 },
  { field: 'description', type: 'string' as const, required: false, maxLength: 5000 },
  { field: 'shortDescription', type: 'string' as const, required: false, maxLength: 500 },
  { field: 'sku', type: 'string' as const, required: false, maxLength: 100 },
  { field: 'price', type: 'number' as const, required: true, min: 0 },
  { field: 'compareAtPrice', type: 'number' as const, required: false, min: 0 },
  { field: 'costPrice', type: 'number' as const, required: false, min: 0 },
  { field: 'stockQuantity', type: 'number' as const, required: false, min: 0 },
  { field: 'minStockLevel', type: 'number' as const, required: false, min: 0 },
  { field: 'weight', type: 'number' as const, required: false, min: 0 },
  { field: 'categoryId', type: 'number' as const, required: true, min: 1 },
  { field: 'seoTitle', type: 'string' as const, required: false, maxLength: 255 },
  { field: 'seoDescription', type: 'string' as const, required: false, maxLength: 500 },
  { field: 'tags', type: 'array' as const, required: false },
  { field: 'isFeatured', type: 'boolean' as const, required: false },
  { field: 'requiresShipping', type: 'boolean' as const, required: false },
];

// Validation rules for product update
const updateProductRules = [
  { field: 'name', type: 'string' as const, required: false, minLength: 2, maxLength: 255 },
  { field: 'description', type: 'string' as const, required: false, maxLength: 5000 },
  { field: 'shortDescription', type: 'string' as const, required: false, maxLength: 500 },
  { field: 'sku', type: 'string' as const, required: false, maxLength: 100 },
  { field: 'price', type: 'number' as const, required: false, min: 0 },
  { field: 'compareAtPrice', type: 'number' as const, required: false, min: 0 },
  { field: 'costPrice', type: 'number' as const, required: false, min: 0 },
  { field: 'stockQuantity', type: 'number' as const, required: false, min: 0 },
  { field: 'minStockLevel', type: 'number' as const, required: false, min: 0 },
  { field: 'weight', type: 'number' as const, required: false, min: 0 },
  { field: 'categoryId', type: 'number' as const, required: false, min: 1 },
  { field: 'seoTitle', type: 'string' as const, required: false, maxLength: 255 },
  { field: 'seoDescription', type: 'string' as const, required: false, maxLength: 500 },
  { field: 'tags', type: 'array' as const, required: false },
  { field: 'isFeatured', type: 'boolean' as const, required: false },
  { field: 'requiresShipping', type: 'boolean' as const, required: false },
  { field: 'status', type: 'string' as const, required: false, pattern: /^(draft|active|archived)$/ },
  { field: 'isActive', type: 'boolean' as const, required: false },
];

// Public routes (no authentication required)
router.get('/', getProducts);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/:id', getProductById);

// Protected routes (authentication required)
router.use(authenticate);

// Vendor/Admin only routes
router.post('/', requireRole('vendor', 'admin'), validateRequest(createProductRules), createProduct);
router.put('/:id', requireOwnership('product'), validateRequest(updateProductRules), updateProduct);
router.delete('/:id', requireOwnership('product'), deleteProduct);
router.patch('/:id/archive', requireOwnership('product'), archiveProduct);

export default router;
