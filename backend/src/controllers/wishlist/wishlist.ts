import { Request, Response } from 'express';
import { prisma } from '../../config';
import { AuthenticatedRequest } from '../../middlewares';

/**
 * Get user wishlist
 */
export const getWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to access wishlist',
        },
      });
      return;
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            isActive: true,
            stockQuantity: true,
            vendor: {
              select: {
                id: true,
                businessName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter out inactive products
    const activeItems = wishlistItems.filter(item => item.product.isActive);

    res.status(200).json({
      success: true,
      data: activeItems,
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to retrieve wishlist',
      },
    });
  }
};

/**
 * Add product to wishlist
 */
export const addToWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to modify wishlist',
        },
      });
      return;
    }

    // Validate product ID
    if (!productId || isNaN(Number(productId))) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        error: {
          code: 'INVALID_PRODUCT_ID',
          details: 'Product ID must be a valid number',
        },
      });
      return;
    }

    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
        error: {
          code: 'PRODUCT_NOT_FOUND',
          details: 'The requested product does not exist',
        },
      });
      return;
    }

    if (!product.isActive) {
      res.status(400).json({
        success: false,
        message: 'Product not available',
        error: {
          code: 'PRODUCT_INACTIVE',
          details: 'This product is no longer available',
        },
      });
      return;
    }

    // Check if product is already in wishlist
    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: Number(productId),
        },
      },
    });

    if (existingItem) {
      res.status(400).json({
        success: false,
        message: 'Product already in wishlist',
        error: {
          code: 'ALREADY_IN_WISHLIST',
          details: 'This product is already in your wishlist',
        },
      });
      return;
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        productId: Number(productId),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            vendor: {
              select: {
                businessName: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: wishlistItem,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to add product to wishlist',
      },
    });
  }
};

/**
 * Remove product from wishlist
 */
export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          details: 'User must be authenticated to modify wishlist',
        },
      });
      return;
    }

    // Validate product ID
    if (!productId || isNaN(Number(productId))) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        error: {
          code: 'INVALID_PRODUCT_ID',
          details: 'Product ID must be a valid number',
        },
      });
      return;
    }

    // Check if item exists in wishlist
    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: Number(productId),
        },
      },
    });

    if (!wishlistItem) {
      res.status(404).json({
        success: false,
        message: 'Item not found in wishlist',
        error: {
          code: 'WISHLIST_ITEM_NOT_FOUND',
          details: 'This product is not in your wishlist',
        },
      });
      return;
    }

    // Remove from wishlist
    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId: Number(productId),
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: {
        code: 'INTERNAL_ERROR',
        details: 'Failed to remove product from wishlist',
      },
    });
  }
};