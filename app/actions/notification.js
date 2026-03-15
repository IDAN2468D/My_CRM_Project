'use server';

import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getNotifications() {
  const session = await getServerSession(authOptions);
  if (!session) return [];
  await dbConnect();
  try {
    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    return JSON.parse(JSON.stringify(notifications));
  } catch (error) {
    return [];
  }
}

export async function markAsRead(notificationId) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  await dbConnect();
  try {
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function createNotification(userId, title, message, type = 'info', link = '') {
  await dbConnect();
  try {
    await Notification.create({ userId, title, message, type, link });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
