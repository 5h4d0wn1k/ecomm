import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './modal';
import { Button } from './button';
import { Input } from './input';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible modal component built on Radix UI with accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
    },
    title: {
      control: 'text',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const ModalWithControls = ({ children, ...args }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {children}
      </Modal>
    </>
  );
};

export const Default: Story = {
  render: (args) => (
    <ModalWithControls {...args}>
      <p className="text-gray-600 mb-4">
        This is the default modal content. You can put any content here.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button onClick={() => {}}>
          Confirm
        </Button>
      </div>
    </ModalWithControls>
  ),
  args: {
    title: 'Default Modal',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <ModalWithControls title="Small Modal" size="sm">
        <p>Small modal content</p>
      </ModalWithControls>

      <ModalWithControls title="Medium Modal" size="md">
        <p>Medium modal content</p>
      </ModalWithControls>

      <ModalWithControls title="Large Modal" size="lg">
        <p>Large modal content</p>
      </ModalWithControls>

      <ModalWithControls title="Extra Large Modal" size="xl">
        <p>Extra large modal content</p>
      </ModalWithControls>
    </div>
  ),
};

export const WithForm: Story = {
  render: (args) => (
    <ModalWithControls {...args}>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input placeholder="Enter your name" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input type="email" placeholder="Enter your email" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md resize-none"
            placeholder="Enter your message"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit">
            Submit
          </Button>
        </div>
      </form>
    </ModalWithControls>
  ),
  args: {
    title: 'Contact Form',
    size: 'md',
  },
};

export const ConfirmationDialog: Story = {
  render: (args) => (
    <ModalWithControls {...args}>
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Delete Item</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this item? This action cannot be undone.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline">
            Cancel
          </Button>
          <Button variant="destructive">
            Delete
          </Button>
        </div>
      </div>
    </ModalWithControls>
  ),
  args: {
    title: 'Confirm Action',
    size: 'sm',
  },
};

export const SuccessDialog: Story = {
  render: (args) => (
    <ModalWithControls {...args}>
      <div className="text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Success!</h3>
        <p className="text-gray-600 mb-6">
          Your action has been completed successfully.
        </p>
        <div className="flex justify-center">
          <Button>
            Continue
          </Button>
        </div>
      </div>
    </ModalWithControls>
  ),
  args: {
    title: 'Success',
    size: 'sm',
  },
};

export const InfoDialog: Story = {
  render: (args) => (
    <ModalWithControls {...args}>
      <div className="text-center">
        <Info className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Information</h3>
        <p className="text-gray-600 mb-6">
          Here's some important information you should know about this feature.
        </p>
        <div className="flex justify-center">
          <Button>
            Got it
          </Button>
        </div>
      </div>
    </ModalWithControls>
  ),
  args: {
    title: 'Information',
    size: 'sm',
  },
};

export const Accessibility: Story = {
  render: (args) => (
    <ModalWithControls {...args}>
      <div className="space-y-4">
        <p className="text-gray-600">
          This modal demonstrates accessibility features:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Proper ARIA attributes for screen readers</li>
          <li>Keyboard navigation support</li>
          <li>Focus management (focus trap)</li>
          <li>Screen reader announcements</li>
          <li>ESC key to close</li>
        </ul>
        <div className="pt-4">
          <Button autoFocus>
            Auto-focused button
          </Button>
        </div>
      </div>
    </ModalWithControls>
  ),
  args: {
    title: 'Accessible Modal',
    size: 'md',
  },
};