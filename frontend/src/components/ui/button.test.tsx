import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';
import { ShoppingCart } from 'lucide-react';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-input');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');

    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole('button')).toHaveClass('underline-offset-4');
  });

  it('renders with Myntra variants', () => {
    const { rerender } = render(<Button variant="myntra-primary">Myntra Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-myntra-pink');

    rerender(<Button variant="myntra-secondary">Myntra Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-myntra-pink-light');

    rerender(<Button variant="myntra-outline">Myntra Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-myntra-pink');

    rerender(<Button variant="myntra-ghost">Myntra Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-myntra-pink');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-9');

    rerender(<Button size="default">Default</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-11');

    rerender(<Button size="xl">Extra Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12');
  });

  it('renders with icon sizes', () => {
    const { rerender } = render(<Button size="icon-sm"><ShoppingCart /></Button>);
    expect(screen.getByRole('button')).toHaveClass('h-8', 'w-8');

    rerender(<Button size="icon"><ShoppingCart /></Button>);
    expect(screen.getByRole('button')).toHaveClass('h-10', 'w-10');

    rerender(<Button size="icon-lg"><ShoppingCart /></Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12', 'w-12');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('forwards other props to button element', () => {
    render(<Button type="submit" data-testid="submit-button">Submit</Button>);
    const button = screen.getByTestId('submit-button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('renders as child when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveClass('inline-flex', 'items-center');
  });

  it('has proper accessibility attributes', () => {
    render(<Button aria-label="Custom label">Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
  });

  it('supports focus and keyboard navigation', () => {
    render(<Button>Focusable Button</Button>);
    const button = screen.getByRole('button');

    button.focus();
    expect(button).toHaveFocus();

    fireEvent.keyDown(button, { key: 'Enter' });
    // Should trigger click event
  });

  it('applies hover and active states', () => {
    render(<Button>Interactive Button</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveClass('transform', 'active:scale-95');
    expect(button).toHaveClass('transition-all', 'duration-200');
  });
});