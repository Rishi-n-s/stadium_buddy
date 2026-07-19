import { render, screen } from '@testing-library/react';
import WeatherWidget from './WeatherWidget';

describe('WeatherWidget', () => {
  it('renders loading state initially or correctly renders data', () => {
    render(<WeatherWidget />);
    // Testing the UI elements since WeatherWidget might use default/mock data immediately
    const tempText = screen.getByText(/72°/i); 
    expect(tempText).toBeInTheDocument();
    
    // Check for precipitation info
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
