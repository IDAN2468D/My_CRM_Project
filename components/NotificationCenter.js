'use client';

import { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '@/app/actions/notification';
import { Bell, Check, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [session]);

  async function fetchNotifs() {
    const data = await getNotifications();
    setNotifications(data);
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'warning': return <AlertTriangle className="text-orange-500" size={16} />;
      case 'error': return <AlertCircle className="text-red-500" size={16} />;
      default: return <Info className="text-blue-500" size={16} />;
    }
  };

  if (!session) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
      >
        <Bell size={20} className="text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-4 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
          <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-black text-slate-900 dark:text-white">התראות מערכת</h3>
            <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full uppercase text-slate-500">{notifications.length} סה"כ</span>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-bold italic">אין התראות חדשות</div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {notifications.map((n) => (
                  <div 
                    key={n._id} 
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">{getIcon(n.type)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-black ${n.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <button 
                              onClick={() => handleMarkAsRead(n._id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="סמן כנקרא"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-bold">{n.message}</p>
                        <p className="text-[9px] text-slate-400 mt-2 uppercase font-black tracking-widest">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: he })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-center border-t border-slate-100 dark:border-slate-800">
            <Link 
              href="/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors block w-full"
            >
              צפה בכל ההתראות
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
