import { render, screen, fireEvent } from '@testing-library/react';
import GlobalChatBot from './GlobalChatBot';
import { vi } from 'vitest';

// Mock the queryCopilot engine
vi.mock('../../services/copilotEngine', () => ({
  queryCopilot: vi.fn(() => ({ answer: 'Mocked Answer', citations: ['id1'] })),
  OPERATIONAL_KNOWLEDGE: [{ id: 'id1', content: 'Mocked Citation' }]
}));

describe('GlobalChatBot', () => {
  it('renders closed by default', () => {
    render(<GlobalChatBot />);
    const openBtn = screen.getByLabelText('Open Assistant Chatbot');
    expect(openBtn).toBeInTheDocument();
    
    const dialog = screen.getByRole('dialog', { hidden: true });
    // It should have opacity 0 or pointer-events-none class
    expect(dialog.className).toContain('opacity-0');
  });

  it('opens and closes properly', () => {
    render(<GlobalChatBot />);
    const openBtn = screen.getByLabelText('Open Assistant Chatbot');
    fireEvent.click(openBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('opacity-100');

    const closeBtn = screen.getByLabelText('Close Assistant');
    fireEvent.click(closeBtn);
    expect(dialog.className).toContain('opacity-0');
  });

  it('handles input and basic sanitization', () => {
    render(<GlobalChatBot />);
    const openBtn = screen.getByLabelText('Open Assistant Chatbot');
    fireEvent.click(openBtn);

    const input = screen.getByLabelText('Type your message');
    const sendBtn = screen.getByLabelText('Send message');

    fireEvent.change(input, { target: { value: '<script>alert(1)</script>' } });
    fireEvent.click(sendBtn);

    // Should have sent sanitized version
    expect(screen.getByText('&lt;script&gt;alert(1)&lt;/script&gt;')).toBeInTheDocument();
  });
});
