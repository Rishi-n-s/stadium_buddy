import { render, screen } from '@testing-library/react';
import Input from './Input';
import { Search } from 'lucide-react';

describe('Input', () => {
  it('renders correctly with default props', () => {
    render(<Input placeholder="Search here" />);
    const input = screen.getByPlaceholderText(/search here/i);
    expect(input).toBeInTheDocument();
  });

  it('renders an icon if provided', () => {
    const { container } = render(<Input icon={Search} placeholder="Search" />);
    // Testing implementation detail (the svg) because it's a visual element inside the wrapper
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('displays an error message when error prop is passed', () => {
    render(<Input placeholder="Email" error="Invalid email address" />);
    const errorMsg = screen.getByText(/invalid email address/i);
    expect(errorMsg).toBeInTheDocument();
    // Verify role alert is present for accessibility
    expect(errorMsg).toHaveAttribute('role', 'alert');
  });
});
