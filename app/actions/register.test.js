import { registerUser } from './register';

jest.mock('@/lib/mongodb', () => jest.fn());
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

jest.mock('@/models/User', () => {
  const mockUser = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  // To mock the constructor, we return a function that returns the mock instance
  function MockUser(data) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.save = mockUser.save;
  }
  MockUser.findOne = mockUser.findOne;
  return MockUser;
});

describe('User Registration Logic', () => {
  let MockUser;
  
  beforeEach(() => {
    jest.clearAllMocks();
    MockUser = require('@/models/User');
  });

  it('fails if email already exists', async () => {
    MockUser.findOne.mockResolvedValue({ email: 'test@example.com' });

    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    const result = await registerUser(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('האימייל כבר קיים במערכת');
  });

  it('fails if password is too short', async () => {
    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'new@example.com');
    formData.append('password', '123');

    const result = await registerUser(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('הסיסמה חייבת להכיל לפחות 8 תווים');
  });

  it('successfully registers a new user', async () => {
    MockUser.findOne.mockResolvedValue(null);
    MockUser.prototype.save = jest.fn().mockResolvedValue(true);

    const formData = new FormData();
    formData.append('name', 'Idan');
    formData.append('email', 'idan@example.com');
    formData.append('password', 'securePassword123');

    const result = await registerUser(formData);

    expect(result.success).toBe(true);
  });
});
