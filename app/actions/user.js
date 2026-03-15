'use server';

import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

// קבלת פרופיל אישי
export async function getUserProfile() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  await dbConnect();
  try {
    const user = await User.findById(session.user.id).select('-password');
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    return null;
  }
}

// עדכון פרופיל
export async function updateProfile(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');
  await dbConnect();
  try {
    const name = formData.get('name');
    const updateData = { name };
    const newPassword = formData.get('newPassword');
    if (newPassword && newPassword.trim() !== '') {
      updateData.password = await bcrypt.hash(newPassword, 12);
    }
    await User.findByIdAndUpdate(session.user.id, updateData);
    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// אדמין: ניהול משתמשים
export async function getAllUsers() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Admin') throw new Error('Forbidden');
  await dbConnect();
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    return [];
  }
}

export async function updateUserRole(userId, newRole) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Admin') throw new Error('Forbidden');
  await dbConnect();
  try {
    await User.findByIdAndUpdate(userId, { role: newRole });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteUser(userId) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Admin') throw new Error('Forbidden');
  if (session.user.id === userId) throw new Error('Cannot delete yourself');
  await dbConnect();
  try {
    await User.findByIdAndDelete(userId);
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
