'use server';

import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function registerUser(formData) {
  await dbConnect();

  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  // Validation
  if (!name || !email || !password) {
    return { success: false, error: 'כל השדות הם חובה' };
  }

  if (password.length < 8) {
    return { success: false, error: 'הסיסמה חייבת להכיל לפחות 8 תווים' };
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: 'האימייל כבר קיים במערכת' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'Agent', // Default role
    });

    await newUser.save();

    return { success: true };
  } catch (error) {
    return { success: false, error: 'אירעה שגיאה בתהליך ההרשמה' };
  }
}
