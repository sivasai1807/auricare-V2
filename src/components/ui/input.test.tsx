import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input Component', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should accept user input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    const input = screen.getByPlaceholderText('Type here') as HTMLInputElement;
    await user.type(input, 'Hello World');

    expect(input.value).toBe('Hello World');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled input" />);
    expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<Input className="custom-class" placeholder="Custom" />);
    const input = screen.getByPlaceholderText('Custom');
    expect(input).toHaveClass('custom-class');
  });

  it('should support different input types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');
  });

  it('should handle value changes', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter value" />);

    const input = screen.getByPlaceholderText('Enter value') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, 'New value');

    expect(input.value).toBe('New value');
  });
});
