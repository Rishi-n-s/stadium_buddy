import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge', () => {
  it('renders correctly with children', () => {
    render(<Badge>New Item</Badge>);
    const badge = screen.getByText(/new item/i);
    expect(badge).toBeInTheDocument();
  });

  it('applies the correct variant class', () => {
    render(<Badge variant="error">Error State</Badge>);
    const badge = screen.getByText(/error state/i);
    // Based on the code, error maps to 'bg-error text-on-error'
    expect(badge).toHaveClass('bg-error');
    expect(badge).toHaveClass('text-on-error');
  });
});
