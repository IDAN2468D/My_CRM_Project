'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-9 w-full bg-slate-800 rounded-xl" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-full flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 text-slate-300 transition-all text-sm font-bold"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-400" />}
      {theme === 'dark' ? 'מצב יום' : 'מצב לילה'}
    </button>
  );
}
