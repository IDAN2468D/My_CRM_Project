'use client';

import { useState, useEffect } from 'react';
import { getCustomers, updateCustomerStatus } from '@/app/actions/customer';
import { Mail, Phone, Clock, GripVertical, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const COLUMNS = [
  { id: 'New', title: 'לידים חדשים', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600', border: 'border-blue-200 dark:border-blue-800' },
  { id: 'In Progress', title: 'בטיפול', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600', border: 'border-amber-200 dark:border-amber-800' },
  { id: 'Completed', title: 'הושלם (סגור)', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600', border: 'border-emerald-200 dark:border-emerald-800' }
];

export default function KanbanBoard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
    setLoading(false);
  };

  const handleDragStart = (e, customerId) => {
    e.dataTransfer.setData('customerId', customerId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const customerId = e.dataTransfer.getData('customerId');
    const customer = customers.find(c => c._id === customerId);
    
    if (customer && customer.status !== newStatus) {
      // Optimistic update
      setCustomers(prev => prev.map(c => c._id === customerId ? { ...c, status: newStatus } : c));
      
      const res = await updateCustomerStatus(customerId, newStatus);
      if (res.success) {
        toast.success(`הסטטוס המעודכן הוא: ${COLUMNS.find(c => c.id === newStatus).title}`);
      } else {
        toast.error('שגיאה בעדכון סטטוס');
        loadCustomers(); // Revert on failure
      }
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-500 animate-pulse">טוען נתונים...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">ניהול עסקאות (Kanban)</h1>
          <p className="text-slate-500 font-bold mt-2 text-sm md:text-base">גרור ושחרר לקוחות כדי לעדכן את שלב העסקה שלהם</p>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 items-start lg:h-[calc(100vh-250px)]">
        {COLUMNS.map(column => {
          const columnCustomers = customers.filter(c => c.status === column.id);
          
          return (
            <div 
              key={column.id}
              className={`flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border ${column.border} overflow-hidden`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className={`p-6 ${column.color} border-b ${column.border} flex justify-between items-center`}>
                <h3 className="font-black text-lg">{column.title}</h3>
                <span className="bg-white/50 dark:bg-black/20 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                  {columnCustomers.length}
                </span>
              </div>
              
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {columnCustomers.map(customer => (
                  <div 
                    key={customer._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, customer._id)}
                    className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -right-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical size={20} />
                    </div>
                    <div className="flex justify-between items-start mb-3">
                        <Link href={`/customers/${customer._id}`}>
                            <h4 className="font-black text-slate-900 dark:text-white hover:text-blue-600 transition-colors">{customer.name}</h4>
                        </Link>
                        {customer.status === 'Completed' && <CheckCircle2 className="text-emerald-500" size={18} />}
                    </div>
                    
                    <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-2">
                           <Phone size={14} /> <span dir="ltr">{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Mail size={14} /> <span className="truncate">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-2 mt-2 border-t border-slate-50 dark:border-slate-700 text-xs">
                           <Clock size={12} /> <span dir="ltr">{new Date(customer.createdAt).toLocaleDateString('he-IL')}</span>
                        </div>
                    </div>
                  </div>
                ))}
                
                {columnCustomers.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-slate-400 text-sm font-bold border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
                    גרור לכאן עסקאות
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
