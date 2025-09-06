import { Router } from 'express';
import {
  register,
  vendorRegister,
  login,
  refresh,
  logout,
  changePassword,
  forgotPassword,
  resetPassword
} from '../controllers/auth';
import {
  authenticate,
  authRateLimit,
  validateRequest,
  userRegistrationRules,
  vendorRegistrationRules,
  loginRules,
  changePasswordRules,
} from '../middlewares';

const router = Router();

// Apply rate limiting to auth routes
router.use(authRateLimit);

// Public routes
router.post('/register', validateRequest(userRegistrationRules), register);
router.post('/vendor-register', validateRequest(vendorRegistrationRules), vendorRegister);
router.post('/login', validateRequest(loginRules), login);
router.post('/refresh', refresh);

// Protected routes
router.post('/logout', authenticate, logout);
router.post('/change-password', authenticate, validateRequest(changePasswordRules), changePassword);

// Password reset routes
router.post('/forgot-password', validateRequest([{ field: 'email', type: 'email', required: true }]), forgotPassword);
router.post('/reset-password', validateRequest([
  { field: 'token', type: 'string', required: true },
  { field: 'password', type: 'string', required: true, minLength: 8 }
]), resetPassword);

export default router;