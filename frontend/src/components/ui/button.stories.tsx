import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { ShoppingCart, Heart, Star, Download } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
        'myntra-primary',
        'myntra-secondary',
        'myntra-outline',
        'myntra-ghost',
        'myntra-success',
        'myntra-warning',
        'myntra-error'
      ],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'xl', 'icon', 'icon-sm', 'icon-lg'],
    },
    disabled: {
      control: 'boolean',
    },
    asChild: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const MyntraVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="myntra-primary">Myntra Primary</Button>
      <Button variant="myntra-secondary">Myntra Secondary</Button>
      <Button variant="myntra-outline">Myntra Outline</Button>
      <Button variant="myntra-ghost">Myntra Ghost</Button>
      <Button variant="myntra-success">Success</Button>
      <Button variant="myntra-warning">Warning</Button>
      <Button variant="myntra-error">Error</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};

export const IconSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="icon-sm">
        <Heart className="w-3 h-3" />
      </Button>
      <Button size="icon">
        <Heart className="w-4 h-4" />
      </Button>
      <Button size="icon-lg">
        <Heart className="w-5 h-5" />
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <ShoppingCart className="w-4 h-4 mr-2" />
        Add to Cart
      </Button>
      <Button variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>
      <Button variant="myntra-primary">
        <Star className="w-4 h-4 mr-2" />
        Favorite
      </Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Normal</Button>
      <Button disabled>Disabled</Button>
      <Button className="cursor-wait">Loading</Button>
    </div>
  ),
};

export const AsChild: Story = {
  render: () => (
    <Button asChild>
      <a href="https://example.com">Link styled as Button</a>
    </Button>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Focus Management</h3>
        <Button>Press Tab to focus me</Button>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Screen Reader Support</h3>
        <Button aria-label="Save document">💾</Button>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Disabled State</h3>
        <Button disabled aria-describedby="disabled-explanation">
          Disabled Button
        </Button>
        <p id="disabled-explanation" className="text-xs text-gray-600 mt-1">
          This button is disabled because the form is incomplete.
        </p>
      </div>
    </div>
  ),
};