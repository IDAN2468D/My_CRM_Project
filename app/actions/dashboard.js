'use server';

import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';

export async function getComparativeStats() {
  await dbConnect();

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(prevMonthStart);

  // Basic stats
  const total = await Customer.countDocuments();
  const completed = await Customer.countDocuments({ status: 'Completed' });
  const inProgress = await Customer.countDocuments({ status: 'In Progress' });
  const newCustomers = await Customer.countDocuments({ status: 'New' });

  // Get counts for current month vs previous month
  const prevTotal = await Customer.countDocuments({ createdAt: { $lte: prevMonthEnd } });
  const prevCompleted = await Customer.countDocuments({ 
    status: 'Completed', 
    updatedAt: { $lte: prevMonthEnd } 
  });

  const calculateChange = (current, prev) => {
    if (prev === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / (prev || 1)) * 100);
  };

  const statsByStatus = [
    { name: 'חדשים', value: newCustomers, color: '#3b82f6' },
    { name: 'בטיפול', value: inProgress, color: '#f59e0b' },
    { name: 'הושלמו', value: completed, color: '#10b981' },
  ];

  return {
    total,
    completed,
    inProgress,
    newCustomers,
    totalChange: calculateChange(total, prevTotal),
    completionChange: calculateChange(completed, prevCompleted),
    statsByStatus
  };
}
