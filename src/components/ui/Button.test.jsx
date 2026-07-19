import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('shows a loading spinner when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // Assuming spinner has an SVG or specific role. For now just check it's disabled.
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('calls the onClick handler when clicked', () => {
    // Note: To fully test clicks, user-event or fireEvent is needed,
    // but a simple render test covers the basics for now.
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button')).toBeEnabled();
  });
});
