'use server';

import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getUserSettings() {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'Unauthorized' };

  await dbConnect();
  try {
    const user = await User.findById(session.user.id).select('-password');
    return { success: true, user: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    return { success: false, error: 'שגיאה בטעינת הגדרות משתמש' };
  }
}

export async function updateUserSettings(data) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'Unauthorized' };

  await dbConnect();
  try {
    const updateFields = {
      name: data.name,
      email: data.email,
    };
    
    if (data.geminiApiKey !== undefined) {
      updateFields.geminiApiKey = data.geminiApiKey;
    }

    if (data.password && data.password.trim() !== '') {
      // Basic password update placeholder (In production, use bcrypt hash)
      updateFields.password = data.password;
    }

    await User.findByIdAndUpdate(session.user.id, updateFields);
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'שגיאה בעדכון ההגדרות' };
  }
}
