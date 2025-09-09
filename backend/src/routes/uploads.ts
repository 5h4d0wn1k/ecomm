import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares';
import { FileUploadService } from '../services';
import { uploadFile, uploadMultipleFiles, uploadProductImages, getUploadSignature } from '../controllers/uploads';

const router = Router();

// Configure multer
const upload = FileUploadService.getMulterConfig();

// Public routes
router.get('/signature', getUploadSignature);

// Protected routes
router.use(authenticate);

// File upload routes
router.post('/single', upload.single('file'), uploadFile);
router.post('/multiple', upload.array('files', 5), uploadMultipleFiles);
router.post('/product-images', upload.array('images', 10), uploadProductImages);

export default router;