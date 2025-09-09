import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('renders with different input types', () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');

    rerender(<Input type="tel" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel');
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter your name" />);
    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('test value');
  });

  it('applies error styling when error prop is true', () => {
    render(<Input error />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-300');
    expect(input).toHaveClass('focus-visible:ring-red-500');
  });

  it('applies success styling when success prop is true', () => {
    render(<Input success />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-green-300');
    expect(input).toHaveClass('focus-visible:ring-green-500');
  });

  it('applies default focus styling when neither error nor success', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('focus-visible:ring-myntra-pink');
    expect(input).toHaveClass('focus-visible:border-myntra-pink');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed');
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('forwards other props to input element', () => {
    render(<Input data-testid="custom-input" maxLength={10} />);
    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('has proper accessibility attributes', () => {
    render(<Input aria-label="Name input" aria-describedby="name-help" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Name input');
    expect(input).toHaveAttribute('aria-describedby', 'name-help');
  });

  it('supports focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');

    input.focus();
    expect(handleFocus).toHaveBeenCalledTimes(1);

    input.blur();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('has proper default styling', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md');
    expect(input).toHaveClass('border', 'bg-background', 'px-3', 'py-2');
    expect(input).toHaveClass('text-sm', 'ring-offset-background');
    expect(input).toHaveClass('placeholder:text-muted-foreground');
    expect(input).toHaveClass('focus-visible:outline-none');
    expect(input).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-offset-2');
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    expect(input).toHaveClass('transition-all', 'duration-200');
  });

  it('supports required attribute', () => {
    render(<Input required />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('required');
  });

  it('supports readOnly attribute', () => {
    render(<Input readOnly value="readonly value" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readOnly');
    expect(input).toHaveValue('readonly value');
  });

  it('handles different input modes', () => {
    render(<Input inputMode="numeric" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('inputMode', 'numeric');
  });

  it('supports autoComplete attribute', () => {
    render(<Input autoComplete="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('autoComplete', 'email');
  });
});