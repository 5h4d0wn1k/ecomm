import type { Meta, StoryObj } from '@storybook/react';
import { Carousel } from './carousel';
import { ProductCard } from '../product/product-card';
import { Button } from './button';

const meta: Meta<typeof Carousel> = {
  title: 'UI/Carousel',
  component: Carousel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A flexible carousel component with accessibility features, auto-play, and keyboard navigation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showDots: {
      control: 'boolean',
    },
    showArrows: {
      control: 'boolean',
    },
    autoPlay: {
      control: 'boolean',
    },
    autoPlayInterval: {
      control: 'number',
    },
    itemsPerView: {
      control: { type: 'select' },
      options: [1, 2, 3, 4],
    },
    infinite: {
      control: 'boolean',
    },
    gap: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Carousel>;

// Mock product data
const mockProducts = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 2999,
    compareAtPrice: 3999,
    images: ['/placeholder-product.jpg'],
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
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    price: 4999,
    compareAtPrice: 6999,
    images: ['/placeholder-product.jpg'],
    brand: 'Apple',
    vendor: { businessName: 'Apple Store', isVerified: true },
    averageRating: 4.8,
    totalReviews: 256,
    totalWishlisted: 89,
    stockQuantity: 5,
    isFeatured: false,
    variants: [
      { id: '4', value: 'Space Gray' },
      { id: '5', value: 'Silver' },
    ],
  },
  {
    id: '3',
    name: 'Gaming Mechanical Keyboard',
    price: 3499,
    compareAtPrice: 4499,
    images: ['/placeholder-product.jpg'],
    brand: 'Razer',
    vendor: { businessName: 'Razer Official', isVerified: true },
    averageRating: 4.3,
    totalReviews: 89,
    totalWishlisted: 67,
    stockQuantity: 15,
    isFeatured: true,
    variants: [
      { id: '6', value: 'RGB' },
      { id: '7', value: 'Black' },
    ],
  },
  {
    id: '4',
    name: 'Wireless Charging Pad',
    price: 1299,
    compareAtPrice: 1599,
    images: ['/placeholder-product.jpg'],
    brand: 'Samsung',
    vendor: { businessName: 'Samsung Hub', isVerified: true },
    averageRating: 4.2,
    totalReviews: 67,
    totalWishlisted: 23,
    stockQuantity: 20,
    isFeatured: false,
    variants: [
      { id: '8', value: 'Fast Charge' },
      { id: '9', value: 'Standard' },
    ],
  },
  {
    id: '5',
    name: 'Bluetooth Speaker',
    price: 2499,
    compareAtPrice: 2999,
    images: ['/placeholder-product.jpg'],
    brand: 'JBL',
    vendor: { businessName: 'JBL Audio', isVerified: true },
    averageRating: 4.6,
    totalReviews: 145,
    totalWishlisted: 78,
    stockQuantity: 8,
    isFeatured: true,
    variants: [
      { id: '10', value: 'Portable' },
      { id: '11', value: 'Home' },
    ],
  },
];

export const Default: Story = {
  args: {
    children: [
      <div key="1" className="bg-blue-500 text-white p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">Slide 1</h3>
        <p>Content for the first slide</p>
      </div>,
      <div key="2" className="bg-green-500 text-white p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">Slide 2</h3>
        <p>Content for the second slide</p>
      </div>,
      <div key="3" className="bg-purple-500 text-white p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">Slide 3</h3>
        <p>Content for the third slide</p>
      </div>,
    ],
  },
};

export const ProductCarousel: Story = {
  args: {
    children: mockProducts.map((product) => (
      <ProductCard key={product.id} product={product} />
    )),
    itemsPerView: 3,
    gap: 20,
  },
};

export const AutoPlay: Story = {
  args: {
    children: [
      <div key="1" className="bg-red-500 text-white p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">Auto-play Slide 1</h3>
        <p>This carousel auto-plays every 3 seconds</p>
      </div>,
      <div key="2" className="bg-yellow-500 text-white p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">Auto-play Slide 2</h3>
        <p>Hover to pause auto-play</p>
      </div>,
      <div key="3" className="bg-indigo-500 text-white p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">Auto-play Slide 3</h3>
        <p>Click dots or arrows to navigate manually</p>
      </div>,
    ],
    autoPlay: true,
    autoPlayInterval: 3000,
  },
};

export const MultipleItems: Story = {
  args: {
    children: Array.from({ length: 8 }, (_, i) => (
      <div key={i} className={`bg-gradient-to-br text-white p-6 rounded-lg text-center h-48 flex flex-col justify-center ${
        ['from-blue-500 to-blue-600', 'from-green-500 to-green-600', 'from-purple-500 to-purple-600', 'from-red-500 to-red-600'][i % 4]
      }`}>
        <h3 className="text-lg font-bold mb-2">Item {i + 1}</h3>
        <p className="text-sm">Multiple items per view</p>
      </div>
    )),
    itemsPerView: 3,
    gap: 16,
  },
};

export const WithoutControls: Story = {
  args: {
    children: [
      <div key="1" className="bg-gray-500 text-white p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">No Dots</h3>
        <p>This carousel has no dot indicators</p>
      </div>,
      <div key="2" className="bg-gray-600 text-white p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">No Arrows</h3>
        <p>This carousel has no arrow controls</p>
      </div>,
    ],
    showDots: false,
    showArrows: false,
  },
};

export const SingleItem: Story = {
  args: {
    children: [
      <div key="1" className="bg-teal-500 text-white p-12 rounded-lg text-center">
        <h3 className="text-2xl font-bold mb-4">Single Item Carousel</h3>
        <p className="text-lg">This carousel shows one item at a time</p>
        <Button className="mt-4" variant="secondary">
          Learn More
        </Button>
      </div>,
    ],
    itemsPerView: 1,
  },
};

export const Accessibility: Story = {
  args: {
    children: [
      <div key="1" className="bg-blue-500 text-white p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">Accessible Carousel</h3>
        <p>Features:</p>
        <ul className="text-sm mt-2 space-y-1">
          <li>• Keyboard navigation (← → Home End)</li>
          <li>• Screen reader support</li>
          <li>• Focus management</li>
          <li>• ARIA labels and live regions</li>
        </ul>
      </div>,
      <div key="2" className="bg-green-500 text-white p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-2">WCAG 2.1 Compliant</h3>
        <p>Meets accessibility standards</p>
      </div>,
    ],
  },
};