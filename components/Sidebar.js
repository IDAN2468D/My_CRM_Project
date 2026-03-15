'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, Users, Columns3, LogOut, CalendarDays, UserCircle, ShieldAlert, CheckSquare, Activity, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (pathname === '/login' || status === 'unauthenticated') {
    return null;
  }

  const menuItems = [
    { name: 'דאשבורד', href: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'אנליטיקה', href: '/analytics', icon: <Activity size={20} /> },
    { name: 'לקוחות', href: '/customers', icon: <Users size={20} /> },
    { name: 'בורד קנבן', href: '/board', icon: <Columns3 size={20} /> },
    { name: 'משימות', href: '/tasks', icon: <CheckSquare size={20} /> },
    { name: 'לוח שנה', href: '/calendar', icon: <CalendarDays size={20} /> },
    { name: 'הגדרות', href: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 dark:bg-black text-white flex flex-col sticky h-screen top-0 transition-colors z-20">
      <div className="p-6">
        <h1 className="text-2xl font-black tracking-tighter text-blue-400">MODERN CRM</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = (item.href === '/' && pathname === '/') ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}

        {session?.user?.role === 'Admin' && (
          <Link
            href="/admin/users"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-sm uppercase tracking-wider mt-10 ${pathname.startsWith('/admin')
                ? 'bg-red-600/20 text-red-500 border border-red-500/20'
                : 'text-slate-500 hover:text-red-400'
              }`}
          >
            <ShieldAlert size={20} />
            ניהול משתמשים
          </Link>
        )}
      </nav>

      <div className="p-6 border-t border-slate-800 space-y-4">
        <ThemeToggle />

        <Link
          href="/profile"
          className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-sm font-bold ${pathname === '/profile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
        >
          <UserCircle size={18} />
          פרופיל אישי
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all text-sm font-bold"
        >
          <LogOut size={18} />
          התנתק
        </button>

        <div className="flex items-center gap-3 text-sm pt-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs uppercase">
            {session?.user?.name?.substring(0, 2) || 'AD'}
          </div>
          <div className="truncate">
            <p className="font-bold truncate">{session?.user?.name || 'Admin'}</p>
            <p className="text-slate-500 text-[10px] uppercase font-black">
              {session?.user?.role || 'Agent'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
