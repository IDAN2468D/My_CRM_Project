import { deleteCustomer } from './customer';
import { getServerSession } from 'next-auth';

// Mock everything
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/lib/mongodb', () => jest.fn());

jest.mock('@/models/Customer', () => ({
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock('@/models/AuditLog', () => ({
  create: jest.fn(),
}));

jest.mock('@/models/Notification', () => ({
  create: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('RBAC Security - Customer Deletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (typeof global.Request === 'undefined') {
      global.Request = class {};
      global.Response = class {};
      global.Headers = class {};
    }
  });

  it('allows Admin to delete a customer', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'admin1', name: 'Admin User', role: 'Admin' }
    });
    
    const Customer = require('@/models/Customer');
    Customer.findById.mockResolvedValue({ name: 'Test Customer' });
    Customer.findByIdAndDelete.mockResolvedValue({});

    const result = await deleteCustomer('cust1');
    expect(result.success).toBe(true);
  });

  it('prevents Agent from deleting a customer', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'agent1', name: 'Agent User', role: 'Agent' }
    });

    await expect(deleteCustomer('cust1')).rejects.toThrow('Only admins can delete customers');
  });
});
