import { render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { name: 'Idan', role: 'Admin' } }, status: 'authenticated' }),
  signOut: jest.fn(),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  LayoutDashboard: () => <div data-testid="icon" />,
  Users: () => <div data-testid="icon" />,
  Columns3: () => <div data-testid="icon" />,
  LogOut: () => <div data-testid="icon" />,
  CalendarDays: () => <div data-testid="icon" />,
  UserCircle: () => <div data-testid="icon" />,
  ShieldAlert: () => <div data-testid="icon" />, // Added this
}));

// Mock ThemeToggle
jest.mock('./ThemeToggle', () => () => <div data-testid="theme-toggle" />);

describe('Sidebar Component', () => {
  it('renders the brand name and menu links when authenticated', () => {
    render(<Sidebar />);
    expect(screen.getByText('MODERN CRM')).toBeInTheDocument();
    expect(screen.getByText('דאשבורד')).toBeInTheDocument();
    expect(screen.getByText('לקוחות')).toBeInTheDocument();
  });
});
