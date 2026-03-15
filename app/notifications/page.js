'use client';

import { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '@/app/actions/notification';
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle2, Trash2, Calendar } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      fetchNotifs();
    }
  }, [session]);

  async function fetchNotifs() {
    setLoading(true);
    const data = await getNotifications();
    setNotifications(data);
    setLoading(false);
  }

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full"><CheckCircle2 size={20} /></div>;
      case 'warning': return <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full"><AlertTriangle size={20} /></div>;
      case 'error': return <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full"><AlertCircle size={20} /></div>;
      default: return <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full"><Info size={20} /></div>;
    }
  };

  if (loading) return <div className="text-center py-20 dark:text-white font-bold animate-pulse">טוען התראות...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">מרכז התראות</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">עקוב אחר כל הפעולות האחרונות במערכת.</p>
        </div>
        <div className="flex items-center gap-3">
             <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-2xl font-black text-sm">
                {notifications.filter(n => !n.isRead).length} התראות חדשות
             </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell size={40} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold text-xl italic">אין התראות להצגה כרגע</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                className={`p-6 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all flex gap-6 items-start ${!n.isRead ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}
              >
                <div className="flex-shrink-0">
                  {getIcon(n.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-lg font-black tracking-tight ${n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                            <Calendar size={14} />
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: he })}
                        </div>
                        {!n.isRead && (
                            <button 
                                onClick={() => handleMarkAsRead(n._id)}
                                className="text-blue-600 hover:text-blue-800 bg-blue-50 dark:bg-blue-400/10 p-2 rounded-xl transition-colors"
                                title="סמן כנקרא"
                            >
                                <Check size={18} />
                            </button>
                        )}
                    </div>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-4 max-w-3xl">
                    {n.message}
                  </p>

                  {n.link && (
                    <Link 
                      href={n.link}
                      className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 dark:bg-blue-400/10 px-4 py-2 rounded-xl"
                    >
                      צפה בפרטים
                      <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArrowRight({ size, className }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}
