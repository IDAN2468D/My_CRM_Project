import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationsPage from './page';
import { getNotifications, markAsRead } from '@/app/actions/notification';
import { useSession } from 'next-auth/react';

// Enhanced mocks to isolate logic from BSON/Mongoose issues in Jest
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('next/link', () => ({ children, href, onClick }) => (
  <a href={href} onClick={onClick}>{children}</a>
));

// Mock the whole notification action module
jest.mock('@/app/actions/notification', () => ({
  getNotifications: jest.fn(),
  markAsRead: jest.fn(),
}));

const mockNotifications = [
  { _id: '1', title: 'התראה 1', message: 'הודעה 1', isRead: false, type: 'info', createdAt: new Date().toISOString() },
  { _id: '2', title: 'התראה 2', message: 'הודעה 2', isRead: true, type: 'success', createdAt: new Date().toISOString() },
];

describe('Notifications Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSession.mockReturnValue({ data: { user: { name: 'Idan' } }, status: 'authenticated' });
    getNotifications.mockResolvedValue(mockNotifications);
  });

  it('renders all notifications', async () => {
    render(<NotificationsPage />);
    
    // Use waitFor for the heading as well since it appears after the loading state
    await waitFor(() => {
      expect(screen.getByText('מרכז התראות')).toBeInTheDocument();
      expect(screen.getByText('התראה 1')).toBeInTheDocument();
      expect(screen.getByText('התראה 2')).toBeInTheDocument();
    });
  });

  it('can mark a notification as read', async () => {
    markAsRead.mockResolvedValue({ success: true });
    render(<NotificationsPage />);
    
    // Wait for the list to load first
    await waitFor(() => expect(screen.getByText('התראה 1')).toBeInTheDocument());
    
    const markButtons = screen.getAllByTitle('סמן כנקרא');
    fireEvent.click(markButtons[0]);
    
    await waitFor(() => {
      expect(markAsRead).toHaveBeenCalledWith('1');
    });
  });
});
