'use server';

import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { revalidatePath } from 'next/cache';

export async function getTasks() {
  try {
    await dbConnect();
    const tasks = await Task.find({}).sort({ dueDate: 1 }).populate('customer', 'name').populate('assignedTo', 'name');
    return JSON.parse(JSON.stringify(tasks));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

export async function createTask(data) {
  try {
    await dbConnect();
    const newTask = new Task(data);
    await newTask.save();
    revalidatePath('/tasks');
    return { success: true, task: JSON.parse(JSON.stringify(newTask)) };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error: 'שגיאה ביצירת יעד' };
  }
}

export async function updateTaskStatus(taskId, newStatus) {
  try {
    await dbConnect();
    await Task.findByIdAndUpdate(taskId, { status: newStatus });
    revalidatePath('/tasks');
    return { success: true };
  } catch (error) {
    console.error('Error updating task statys:', error);
    return { success: false, error: 'שגיאה בעדכון מצב המשימה' };
  }
}
