import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/login/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

describe('Login Page UI Redesign', () => {
  it('renders login form correctly with new placeholders', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('contains the branding and login texts', () => {
    render(<LoginPage />);
    const branding = screen.getAllByText(/MODERN CRM/);
    expect(branding.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/התחברות/)[0]).toBeInTheDocument();
  });
});
