'use server';

import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';
import AuditLog from '@/models/AuditLog';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notification';

async function logAction(action, customerId, details = '') {
  const session = await getServerSession(authOptions);
  if (!session) return;

  await AuditLog.create({
    userId: session.user.id,
    userName: session.user.name,
    action,
    customerId,
    details,
  });
}

export async function getCustomers(query = '', status = '') {
  await dbConnect();
  try {
    let filter = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ];
    }
    if (status) {
      filter.status = status;
    }
    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(customers));
  } catch (error) {
    return [];
  }
}

export async function getCustomerById(id) {
  await dbConnect();
  try {
    const customer = await Customer.findById(id);
    const auditLogs = await AuditLog.find({ customerId: id }).sort({ timestamp: -1 });
    return JSON.parse(JSON.stringify({ ...customer.toObject(), auditLogs }));
  } catch (error) {
    return null;
  }
}

export async function getDashboardStats() {
  await dbConnect();
  try {
    const total = await Customer.countDocuments();
    const newLeads = await Customer.countDocuments({ status: 'New' });
    const completed = await Customer.countDocuments({ status: 'Completed' });
    const inProgress = await Customer.countDocuments({ status: 'In Progress' });
    const recent = await Customer.find().sort({ createdAt: -1 }).limit(5);

    const statsByStatus = [
      { name: 'חדש', value: newLeads, color: '#3b82f6' },
      { name: 'בטיפול', value: inProgress, color: '#f97316' },
      { name: 'הושלם', value: completed, color: '#10b981' },
    ];

    return { total, newLeads, completed, statsByStatus, recent: JSON.parse(JSON.stringify(recent)) };
  } catch (error) {
    return { total: 0, newLeads: 0, completed: 0, statsByStatus: [], recent: [] };
  }
}

export async function addCustomer(formData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await dbConnect();
  try {
    const newCustomer = new Customer({
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      status: formData.get('status') || 'New',
    });
    await newCustomer.save();
    await logAction('CREATE_CUSTOMER', newCustomer._id, `התווסף לקוח: ${newCustomer.name}`);
    
    await createNotification(session.user.id, 'לקוח חדש נוסף', `הלקוח ${newCustomer.name} נוסף למערכת בהצלחה`, 'success', `/customers/${newCustomer._id}`);

    revalidatePath('/customers');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateCustomerStatus(id, newStatus) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await dbConnect();
  try {
    const customer = await Customer.findById(id);
    const oldStatus = customer.status;
    customer.status = newStatus;
    
    // Feature: Automated Workflow
    // If status becomes "Completed", automatically add a follow-up task 30 days from now
    if (newStatus === 'Completed' && oldStatus !== 'Completed') {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 30);
      
      // Add to internal nested tasks (for customer page)
      customer.tasks.push({
        title: 'שיחת פולואו-אפ אוטומטית (עסקה נסגרה)',
        dueDate: followUpDate,
        isCompleted: false
      });

      // ALSO add to the new Global Task model so it appears on the Tasks page
      try {
        const Task = (await import('@/models/Task')).default;
        await Task.create({
          title: `שיחת פולואו-אפ: ${customer.name}`,
          description: 'משימה אוטומטית לאחר סגירת עסקה',
          customer: customer._id,
          assignedTo: session.user.id,
          dueDate: followUpDate,
          status: 'Pending',
          priority: 'High'
        });
      } catch (e) {
        console.error('Failed to create global task:', e);
      }

      await logAction('WORKFLOW_TRIGGER', id, `יוצרה משימת פולואו-אפ אוטומטית`);
    }

    await customer.save();
    
    await logAction('UPDATE_STATUS', id, `שינוי סטטוס מ-${oldStatus} ל-${newStatus}`);
    await createNotification(session.user.id, 'סטטוס לקוח עודכן', `הסטטוס של ${customer.name} שונה ל-${newStatus}`, 'info', `/customers/${id}`);

    revalidatePath(`/customers/${id}`);
    revalidatePath('/customers');
    revalidatePath('/board');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function addNote(customerId, text) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await dbConnect();
  try {
    await Customer.findByIdAndUpdate(customerId, {
      $push: { notes: { text, createdAt: new Date() } }
    });
    await logAction('ADD_NOTE', customerId, 'התווספה הערה חדשה');
    revalidatePath(`/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteCustomer(id) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'Admin') {
    throw new Error('Only admins can delete customers');
  }

  await dbConnect();
  try {
    const customer = await Customer.findById(id);
    await Customer.findByIdAndDelete(id);
    await logAction('DELETE_CUSTOMER', id, `נמחק הלקוח: ${customer.name}`);
    
    await createNotification(session.user.id, 'לקוח נמחק', `הלקוח ${customer.name} הוסר מהמערכת`, 'warning');

    revalidatePath('/customers');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// Tasks Actions
export async function addTask(customerId, title, dueDate) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await dbConnect();
  try {
    await Customer.findByIdAndUpdate(customerId, {
      $push: { tasks: { title, dueDate, isCompleted: false } }
    });
    await logAction('ADD_TASK', customerId, `התווספה משימה: ${title}`);
    await createNotification(session.user.id, 'משימה חדשה', `נוספה משימה: ${title}`, 'info');
    revalidatePath(`/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function toggleTask(customerId, taskId, currentStatus) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await dbConnect();
  try {
    await Customer.updateOne(
      { _id: customerId, "tasks._id": taskId },
      { $set: { "tasks.$.isCompleted": !currentStatus } }
    );
    revalidatePath(`/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteTask(customerId, taskId) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await dbConnect();
  try {
    await Customer.findByIdAndUpdate(customerId, {
      $pull: { tasks: { _id: taskId } }
    });
    revalidatePath(`/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getCalendarTasks() {
  await dbConnect();
  try {
    const customers = await Customer.find({ "tasks.isCompleted": false });
    let allTasks = [];
    customers.forEach(c => {
      c.tasks.forEach(t => {
        if (!t.isCompleted && t.dueDate) {
          allTasks.push({
            id: t._id.toString(),
            title: `${c.name}: ${t.title}`,
            start: t.dueDate,
            customerId: c._id.toString(),
            color: '#3b82f6'
          });
        }
      });
    });
    return JSON.parse(JSON.stringify(allTasks));
  } catch (error) {
    return [];
  }
}

export async function uploadDocument(customerId, name, url, fileType) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await dbConnect();
  try {
    await Customer.findByIdAndUpdate(customerId, {
      $push: { documents: { name, type: fileType, url, uploadedAt: new Date() } }
    });
    await logAction('UPLOAD_DOCUMENT', customerId, `הועלה מסמך: ${name}`);
    revalidatePath(`/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'שגיאה בהעלאת מסמך' };
  }
}

export async function deleteDocument(customerId, documentId) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await dbConnect();
  try {
    await Customer.findByIdAndUpdate(customerId, {
      $pull: { documents: { _id: documentId } }
    });
    await logAction('DELETE_DOCUMENT', customerId, `נמחק מסמך`);
    revalidatePath(`/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

