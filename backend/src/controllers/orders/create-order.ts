import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';
import { logAuditEvent, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../../utils/audit';
import { NotificationService } from '../../services';

/**
 * Create a new order
 */
export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
      notes,
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to create orders',
        },
      });
      return;
    }

    // Validate products and calculate totals
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'active',
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            isVerified: true,
          },
        },
      },
    });

    if (products.length !== productIds.length) {
      res.status(400).json({
        success: false,
        message: 'Some products are not available',
        error: {
          code: 'INVALID_PRODUCTS',
          details: 'One or more products are inactive or do not exist',
        },
      });
      return;
    }

    // Check stock availability and calculate prices
    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

      // Check if vendor is verified
      if (!product.vendor.isVerified) {
        res.status(400).json({
          success: false,
          message: 'Product from unverified vendor',
          error: {
            code: 'VENDOR_NOT_VERIFIED',
            details: `Product "${product.name}" is from an unverified vendor`,
          },
        });
        return;
      }

      let unitPrice = Number(product.price);
      let availableStock = product.stockQuantity;

      // Handle product variants (simplified - variants not implemented in current schema)
      if (item.variantId) {
        // For now, we'll skip variant handling since it's not in the current schema
        // This would need to be implemented when variants are added to the schema
        res.status(400).json({
          success: false,
          message: 'Product variants not currently supported',
          error: {
            code: 'VARIANTS_NOT_SUPPORTED',
            details: `Product variants are not implemented in the current system`,
          },
        });
        return;
      }

      // Check stock availability
      if (availableStock < item.quantity) {
        res.status(400).json({
          success: false,
          message: 'Insufficient stock',
          error: {
            code: 'INSUFFICIENT_STOCK',
            details: `Only ${availableStock} units available for "${product.name}"`,
          },
        });
        return;
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        productId: product.id,
        vendorId: product.vendorId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        productSnapshot: {
          name: product.name,
          description: product.shortDescription,
          images: product.images,
          sku: product.sku,
          variantId: item.variantId || null,
        },
      });
    }

    // Apply coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          isActive: true,
          startsAt: { lte: new Date() },
          expiresAt: { gte: new Date() },
          OR: [
            { usageLimit: null },
            { usageCount: { lt: prisma.coupon.fields.usageLimit } },
          ],
        },
      });

      if (!coupon) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired coupon',
          error: {
            code: 'INVALID_COUPON',
            details: 'The coupon code is invalid, expired, or has reached its usage limit',
          },
        });
        return;
      }

      // Check minimum order amount
      if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
        res.status(400).json({
          success: false,
          message: 'Minimum order amount not met',
          error: {
            code: 'MINIMUM_ORDER_NOT_MET',
            details: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
          },
        });
        return;
      }

      // Calculate discount
      if (coupon.discountType === 'percentage') {
        discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
      } else if (coupon.discountType === 'fixed') {
        discountAmount = Number(coupon.discountValue);
      }

      // Apply maximum discount limit
      if (coupon.maxDiscountAmount && discountAmount > Number(coupon.maxDiscountAmount)) {
        discountAmount = Number(coupon.maxDiscountAmount);
      }

      discountAmount = Math.min(discountAmount, subtotal);
    }

    // Calculate tax (simplified - 18% GST for India)
    const taxRate = 0.18;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * taxRate;

    // Calculate shipping (simplified)
    const shippingAmount = subtotal >= 500 ? 0 : 50; // Free shipping above ₹500

    const totalAmount = subtotal - discountAmount + taxAmount + shippingAmount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the order
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber,
          subtotal,
          taxAmount,
          shippingAmount,
          discountAmount,
          totalAmount,
          shippingAddress,
          billingAddress,
          paymentMethod,
          notes,
          orderItems: {
            create: orderItems,
          },
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
              vendor: {
                select: {
                  id: true,
                  businessName: true,
                },
              },
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Update product stock
      for (const item of items) {
        const orderItem = orderItems.find(oi => oi.productId === item.productId);
        if (!orderItem) continue;

        if (item.variantId) {
          // Update variant stock
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });
        } else {
          // Update product stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Update coupon usage count
      if (couponCode) {
        await tx.coupon.update({
          where: { code: couponCode },
          data: {
            usageCount: { increment: 1 },
          },
        });
      }

      // Create vendor earnings records
      for (const orderItem of orderItems) {
        const vendor = await tx.vendor.findUnique({
          where: { id: orderItem.vendorId },
          select: { commissionRate: true },
        });

        if (vendor) {
          const grossAmount = orderItem.totalPrice;
          const commissionAmount = (grossAmount * Number(vendor.commissionRate)) / 100;
          const netAmount = grossAmount - commissionAmount;

          await tx.vendorEarning.create({
            data: {
              vendorId: orderItem.vendorId,
              orderId: newOrder.id,
              orderItemId: orderItem.id,
              grossAmount,
              commissionAmount,
              netAmount,
              status: 'pending',
            },
          });
        }
      }

      return newOrder;
    });

    // Send notifications
    await NotificationService.createOrderNotification(
      userId,
      order.id,
      order.orderNumber,
      'created'
    );

    // Create shipping if not COD
    if (paymentMethod !== 'cod') {
      try {
        const { ShippingService } = await import('../../services');
        // This would be called when payment is confirmed
        // For now, we'll create the shipment after order creation
        // In production, this should be triggered after payment confirmation
      } catch (error) {
        console.warn('Shipping integration not configured:', error);
      }
    }

    // Audit log
    await logAuditEvent({
      userId,
      action: AUDIT_ACTIONS.ORDER_CREATE,
      resource: AUDIT_RESOURCES.ORDER,
      resourceId: order.id.toString(),
      details: {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        itemCount: orderItems.length,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to create order',
      },
    });
  }
};