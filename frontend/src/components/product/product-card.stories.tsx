import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './product-card';

const meta: Meta<typeof ProductCard> = {
  title: 'Product/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A comprehensive product card component with wishlist, compare, and quick view features.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

const mockProduct = {
  id: '1',
  name: 'Wireless Bluetooth Headphones',
  price: 2999,
  compareAtPrice: 3999,
  images: ['/placeholder-product.jpg', '/placeholder-product.jpg'],
  brand: 'Sony',
  vendor: { businessName: 'Sony Store', isVerified: true },
  averageRating: 4.5,
  totalReviews: 128,
  totalWishlisted: 45,
  stockQuantity: 10,
  isFeatured: true,
  variants: [
    { id: '1', value: 'Black' },
    { id: '2', value: 'White' },
    { id: '3', value: 'Blue' },
  ],
  shortDescription: 'High-quality wireless headphones with noise cancellation',
  description: 'Experience premium sound quality with these wireless Bluetooth headphones featuring active noise cancellation, 30-hour battery life, and premium comfort.',
};

export const Default: Story = {
  args: {
    product: mockProduct,
  },
};

export const Featured: Story = {
  args: {
    product: {
      ...mockProduct,
      isFeatured: true,
    },
  },
};

export const OnSale: Story = {
  args: {
    product: {
      ...mockProduct,
      compareAtPrice: 3999,
      price: 2999,
    },
  },
};

export const OutOfStock: Story = {
  args: {
    product: {
      ...mockProduct,
      stockQuantity: 0,
    },
  },
};

export const HighRated: Story = {
  args: {
    product: {
      ...mockProduct,
      averageRating: 4.8,
      totalReviews: 256,
    },
  },
};

export const LowRated: Story = {
  args: {
    product: {
      ...mockProduct,
      averageRating: 3.2,
      totalReviews: 45,
    },
  },
};

export const WithManyVariants: Story = {
  args: {
    product: {
      ...mockProduct,
      variants: [
        { id: '1', value: 'Black' },
        { id: '2', value: 'White' },
        { id: '3', value: 'Blue' },
        { id: '4', value: 'Red' },
        { id: '5', value: 'Green' },
        { id: '6', value: 'Yellow' },
        { id: '7', value: 'Purple' },
      ],
    },
  },
};

export const NoVariants: Story = {
  args: {
    product: {
      ...mockProduct,
      variants: [],
    },
  },
};

export const VerifiedVendor: Story = {
  args: {
    product: {
      ...mockProduct,
      vendor: { businessName: 'Premium Electronics', isVerified: true },
    },
  },
};

export const UnverifiedVendor: Story = {
  args: {
    product: {
      ...mockProduct,
      vendor: { businessName: 'Local Shop', isVerified: false },
    },
  },
};

export const LongProductName: Story = {
  args: {
    product: {
      ...mockProduct,
      name: 'Premium Wireless Noise Cancelling Bluetooth Headphones with 30-Hour Battery Life and Premium Comfort Padding',
    },
  },
};

export const ExpensiveProduct: Story = {
  args: {
    product: {
      ...mockProduct,
      price: 99999,
      compareAtPrice: 129999,
    },
  },
};

export const BudgetProduct: Story = {
  args: {
    product: {
      ...mockProduct,
      price: 499,
      compareAtPrice: 699,
    },
  },
};

export const NewArrival: Story = {
  args: {
    product: {
      ...mockProduct,
      isFeatured: false,
      totalWishlisted: 2,
      totalReviews: 0,
      averageRating: 0,
    },
  },
};

export const PopularProduct: Story = {
  args: {
    product: {
      ...mockProduct,
      totalWishlisted: 500,
      totalReviews: 1000,
      averageRating: 4.9,
    },
  },
};