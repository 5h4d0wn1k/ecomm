import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailData {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

export interface WelcomeEmailData {
  to: string;
  firstName: string;
  role?: 'customer' | 'vendor';
}

export interface PasswordResetEmailData {
  to: string;
  firstName: string;
  resetToken: string;
  resetUrl: string;
}

export interface OrderConfirmationEmailData {
  to: string;
  firstName: string;
  orderNumber: string;
  orderTotal: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface VendorApprovalEmailData {
  to: string;
  firstName: string;
  businessName: string;
  approved: boolean;
  message?: string;
}

/**
 * Email Service
 * Handles email sending using SendGrid
 */
export class EmailService {
  private static readonly FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ecommerce.com';
  private static readonly FROM_NAME = process.env.FROM_NAME || 'E-Commerce Platform';

  /**
   * Send basic email
   */
  static async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log('Email would be sent:', emailData);
        return true; // Skip sending in development
      }

      const msg: any = {
        to: emailData.to,
        from: {
          email: this.FROM_EMAIL,
          name: this.FROM_NAME,
        },
        subject: emailData.subject,
        ...(emailData.text && { text: emailData.text }),
        ...(emailData.html && { html: emailData.html }),
        ...(emailData.templateId && {
          templateId: emailData.templateId,
          dynamicTemplateData: emailData.dynamicTemplateData,
        }),
      };

      await sgMail.send(msg);
      console.log(`Email sent successfully to ${emailData.to}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send welcome email to new user
   */
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const subject = data.role === 'vendor' ? 'Welcome to Our Vendor Platform!' : 'Welcome to Our Platform!';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome ${data.firstName}!</h1>
        <p>Thank you for joining our e-commerce platform.</p>
        ${data.role === 'vendor' ? `
          <p>Your vendor application is being reviewed. You'll receive an email once it's approved.</p>
          <p>In the meantime, you can:</p>
          <ul>
            <li>Complete your vendor profile</li>
            <li>Prepare your product listings</li>
            <li>Review our vendor guidelines</li>
          </ul>
        ` : `
          <p>You can now start shopping and explore thousands of products from our verified vendors.</p>
          <p>Happy shopping!</p>
        `}
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The E-Commerce Team</p>
      </div>
    `;

    return this.sendEmail({
      to: data.to,
      subject,
      html,
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hi ${data.firstName},</p>
        <p>You requested a password reset for your account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this password reset, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>The E-Commerce Team</p>
      </div>
    `;

    return this.sendEmail({
      to: data.to,
      subject: 'Password Reset Request',
      html,
    });
  }

  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmationEmail(data: OrderConfirmationEmailData): Promise<boolean> {
    const itemsHtml = data.orderItems.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Confirmation</h1>
        <p>Hi ${data.firstName},</p>
        <p>Thank you for your order! Your order <strong>#${data.orderNumber}</strong> has been confirmed.</p>
        
        <h3>Order Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Quantity</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background-color: #f8f9fa;">
              <td colspan="2" style="padding: 12px; text-align: right; border-top: 2px solid #dee2e6;">Total:</td>
              <td style="padding: 12px; text-align: right; border-top: 2px solid #dee2e6;">₹${data.orderTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <p>We'll send you another email when your order ships.</p>
        <p>Best regards,<br>The E-Commerce Team</p>
      </div>
    `;

    return this.sendEmail({
      to: data.to,
      subject: `Order Confirmation - #${data.orderNumber}`,
      html,
    });
  }

  /**
   * Send vendor approval/rejection email
   */
  static async sendVendorApprovalEmail(data: VendorApprovalEmailData): Promise<boolean> {
    const subject = data.approved 
      ? 'Congratulations! Your Vendor Application is Approved'
      : 'Vendor Application Status Update';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${data.approved ? '#28a745' : '#dc3545'};">
          ${data.approved ? 'Application Approved!' : 'Application Update'}
        </h1>
        <p>Hi ${data.firstName},</p>
        
        ${data.approved ? `
          <p>Great news! Your vendor application for <strong>${data.businessName}</strong> has been approved.</p>
          <p>You can now:</p>
          <ul>
            <li>Start adding your products</li>
            <li>Manage your inventory</li>
            <li>Process orders from customers</li>
            <li>Track your earnings</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/vendor/dashboard" 
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Access Vendor Dashboard
            </a>
          </div>
        ` : `
          <p>Thank you for your interest in becoming a vendor with us.</p>
          <p>Unfortunately, we cannot approve your application for <strong>${data.businessName}</strong> at this time.</p>
          ${data.message ? `<p><strong>Reason:</strong> ${data.message}</p>` : ''}
          <p>You're welcome to reapply after addressing any issues mentioned above.</p>
        `}
        
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The E-Commerce Team</p>
      </div>
    `;

    return this.sendEmail({
      to: data.to,
      subject,
      html,
    });
  }

  /**
   * Send order status update email
   */
  static async sendOrderStatusEmail(
    to: string,
    firstName: string,
    orderNumber: string,
    status: string,
    trackingNumber?: string
  ): Promise<boolean> {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being prepared.',
      processing: 'Your order is being processed and will ship soon.',
      shipped: `Your order has been shipped${trackingNumber ? ` with tracking number: ${trackingNumber}` : ''}.`,
      delivered: 'Your order has been delivered successfully.',
      cancelled: 'Your order has been cancelled.',
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Status Update</h1>
        <p>Hi ${firstName},</p>
        <p>Your order <strong>#${orderNumber}</strong> status has been updated.</p>
        <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
        <p>${statusMessages[status as keyof typeof statusMessages] || 'Your order status has been updated.'}</p>
        
        ${trackingNumber ? `
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong>Tracking Number:</strong> ${trackingNumber}
          </div>
        ` : ''}
        
        <p>Best regards,<br>The E-Commerce Team</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `Order Update - #${orderNumber}`,
      html,
    });
  }
}