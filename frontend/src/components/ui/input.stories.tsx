import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Search, Mail, Lock, User } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with validation states and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
    success: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Types: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email address" />
      <Input type="password" placeholder="Password" />
      <Input type="number" placeholder="Number" />
      <Input type="tel" placeholder="Phone number" />
      <Input type="url" placeholder="Website URL" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-1">Normal State</label>
        <Input placeholder="Normal input" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Error State</label>
        <Input placeholder="Error input" error />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Success State</label>
        <Input placeholder="Success input" success />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Disabled State</label>
        <Input placeholder="Disabled input" disabled />
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input className="pl-10" placeholder="Search..." />
      </div>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input className="pl-10" type="email" placeholder="Email" />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input className="pl-10" type="password" placeholder="Password" />
      </div>
      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input className="pl-10" placeholder="Username" />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input className="h-8 text-sm" placeholder="Small input" />
      <Input className="h-10" placeholder="Default input" />
      <Input className="h-12 text-lg" placeholder="Large input" />
    </div>
  ),
};

export const Validation: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email Address *
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          required
          aria-describedby="email-help email-error"
        />
        <p id="email-help" className="text-xs text-gray-500 mt-1">
          We'll never share your email with anyone else.
        </p>
        <p id="email-error" className="text-xs text-red-600 mt-1" role="alert">
          Please enter a valid email address.
        </p>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          error
          aria-describedby="password-error"
        />
        <p id="password-error" className="text-xs text-red-600 mt-1" role="alert">
          Password must be at least 8 characters long.
        </p>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
          Confirm Password
        </label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Confirm your password"
          success
          aria-describedby="confirm-success"
        />
        <p id="confirm-success" className="text-xs text-green-600 mt-1">
          Passwords match!
        </p>
      </div>
    </div>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label htmlFor="accessible-input" className="block text-sm font-medium mb-1">
          Accessible Input with Label
        </label>
        <Input
          id="accessible-input"
          placeholder="This input has proper labeling"
          aria-describedby="input-description"
        />
        <p id="input-description" className="text-xs text-gray-500 mt-1">
          This description is linked to the input via aria-describedby.
        </p>
      </div>

      <div>
        <Input
          placeholder="Input with aria-label"
          aria-label="Search for products"
        />
      </div>

      <div>
        <Input
          placeholder="Required field"
          required
          aria-required="true"
        />
      </div>
    </div>
  ),
};