import { render, screen, fireEvent } from '@testing-library/react';
import TaskList from './TaskList';

// Mocking Server Actions to avoid Mongoose/DB issues in UI tests
jest.mock('@/app/actions/customer', () => ({
  addTask: jest.fn(),
  toggleTask: jest.fn(),
  deleteTask: jest.fn(),
}));

describe('TaskList Component', () => {
  const mockTasks = [
    { _id: '1', title: 'Test Task', isCompleted: false, dueDate: new Date().toISOString() }
  ];

  it('renders the task list with initial tasks', () => {
    render(<TaskList customerId="123" initialTasks={mockTasks} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('shows the empty state when no tasks are provided', () => {
    render(<TaskList customerId="123" initialTasks={[]} />);
    expect(screen.getByText('אין משימות פתוחות')).toBeInTheDocument();
  });

  it('validates the input field for new tasks', () => {
    render(<TaskList customerId="123" initialTasks={[]} />);
    const input = screen.getByPlaceholderText('מה צריך לעשות?');
    fireEvent.change(input, { target: { value: 'New Task Title' } });
    expect(input.value).toBe('New Task Title');
  });
});
