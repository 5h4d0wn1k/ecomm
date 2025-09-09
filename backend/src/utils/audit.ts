import { prisma } from '../config';

export interface AuditLogData {
  userId?: number;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export const logAuditEvent = async (data: AuditLogData): Promise<void> => {
  try {
    // For now, we'll log to console. In production, this should be stored in a database
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    };

    console.log('AUDIT:', JSON.stringify(logEntry, null, 2));

    // TODO: Store in audit log table when schema is updated
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};

export const AUDIT_ACTIONS = {
  USER_REGISTER: 'USER_REGISTER',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_PASSWORD_CHANGE: 'USER_PASSWORD_CHANGE',
  USER_PROFILE_UPDATE: 'USER_PROFILE_UPDATE',
  USER_DEACTIVATE: 'USER_DEACTIVATE',
  USER_REACTIVATE: 'USER_REACTIVATE',
  VENDOR_REGISTER: 'VENDOR_REGISTER',
  VENDOR_APPROVE: 'VENDOR_APPROVE',
  VENDOR_REJECT: 'VENDOR_REJECT',
  VENDOR_SUSPEND: 'VENDOR_SUSPEND',
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_UPDATE: 'PRODUCT_UPDATE',
  PRODUCT_DELETE: 'PRODUCT_DELETE',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  CATEGORY_CREATED: 'CATEGORY_CREATED',
  CATEGORY_UPDATED: 'CATEGORY_UPDATED',
  CATEGORY_DELETED: 'CATEGORY_DELETED',
  ORDER_CREATE: 'ORDER_CREATE',
  ORDER_UPDATE: 'ORDER_UPDATE',
  PAYMENT_PROCESS: 'PAYMENT_PROCESS',
  ADMIN_USER_UPDATE: 'ADMIN_USER_UPDATE',
  ADMIN_ROLE_CHANGE: 'ADMIN_ROLE_CHANGE',
  FAILED_LOGIN_ATTEMPT: 'FAILED_LOGIN_ATTEMPT',
  ACCOUNT_LOCKOUT: 'ACCOUNT_LOCKOUT',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE: 'PASSWORD_RESET_COMPLETE',
} as const;

export const AUDIT_RESOURCES = {
  USER: 'USER',
  VENDOR: 'VENDOR',
  PRODUCT: 'PRODUCT',
  ORDER: 'ORDER',
  PAYMENT: 'PAYMENT',
  CATEGORY: 'CATEGORY',
  AUTH: 'AUTH',
  PROFILE: 'PROFILE',
  ADMIN: 'ADMIN',
} as const;