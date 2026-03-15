'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function MobileMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { status } = useSession();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (pathname === '/login' || status === 'unauthenticated') {
    return null;
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-64 bg-slate-900 dark:bg-black h-full shadow-2xl flex flex-col pt-4 overflow-y-auto animate-in slide-in-from-right-8 duration-300">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 left-4 p-2 bg-slate-800 text-slate-300 rounded-full hover:text-white transition-colors z-[110]"
            >
              <X size={20} />
            </button>
            <div className="-mt-4 h-full">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
