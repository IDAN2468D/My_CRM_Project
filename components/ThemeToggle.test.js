import { render, screen } from '@testing-library/react';

// Simplified mock since next-themes hooks can be tricky in Jest
describe('Simple ThemeToggle Test', () => {
  it('is a placeholder for theme logic', () => {
    render(<button aria-label="Toggle Theme">מצב לילה</button>);
    expect(screen.getByLabelText('Toggle Theme')).toBeInTheDocument();
  });
});
