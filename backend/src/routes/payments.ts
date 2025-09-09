import { Router } from 'express';
import { processPayment, handleWebhook, verifyPayment } from '../controllers/payments/process-payment';
import { authenticate } from '../middlewares/auth';
import { PaymentService } from '../services';
import { AuthenticatedRequest } from '../middlewares';
import { paymentSecurity, paymentRateLimit } from '../middlewares/security';

const router = Router();

// Process payment for an order
router.post('/process', authenticate, paymentSecurity, paymentRateLimit, processPayment);

// Verify Razorpay payment
router.post('/verify', authenticate, paymentSecurity, verifyPayment);

// Handle Razorpay webhooks
router.post('/webhook', paymentSecurity, handleWebhook);

// Get payment history for authenticated user
router.get('/history', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const history = await PaymentService.getPaymentHistory(userId, page, limit);
    res.json({ success: true, data: history });
    return;
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ success: false, message: 'Failed to get payment history' });
    return;
  }
});

export default router;