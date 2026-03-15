import { getAllUsers, updateUserRole } from '@/app/actions/user';
import { getServerSession } from 'next-auth';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('@/models/User', () => {
    const mockUser = {
        find: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockImplementation(() => []),
        findByIdAndUpdate: jest.fn().mockResolvedValue({}),
        findByIdAndDelete: jest.fn().mockResolvedValue({}),
    };
    return mockUser;
});

jest.mock('@/lib/mongodb', () => jest.fn());

describe('Admin Panel Logic', () => {
  it('denies access to getAllUsers for non-admin users', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'agent1', role: 'Agent' }
    });

    await expect(getAllUsers()).rejects.toThrow('Forbidden');
  });

  it('allows Admin to update user roles', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'admin1', role: 'Admin' }
    });

    const res = await updateUserRole('user1', 'Admin');
    expect(res.success).toBe(true);
  });
});
