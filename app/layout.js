import './globals.css';
import Sidebar from '@/components/Sidebar';
import MobileMenu from '@/components/MobileMenu';
import { ThemeProvider } from '@/components/ThemeProvider';
import AuthProvider from '@/components/AuthProvider';
import NotificationCenter from '@/components/NotificationCenter';
import { Toaster } from 'react-hot-toast';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Advanced CRM System',
  description: 'Manage your customers with speed and elegance',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Toaster position="bottom-left" />
            <div className="flex">
              <SidebarWrapper>
                <Sidebar />
              </SidebarWrapper>
              
              <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                {/* Main Header */}
                <header className="h-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 z-10 shrink-0 shadow-sm">
                  {/* Right side (Mobile menu & Search) */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="md:hidden">
                      <MobileMenu>
                        <Sidebar />
                      </MobileMenu>
                    </div>
                    
                    <div className="hidden md:flex items-center w-full max-w-xl">
                      <div className="relative w-full">
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Search size={18} />
                        </span>
                        <input 
                          type="text" 
                          placeholder="חיפוש חכם (⌘K)" 
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pr-12 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Left side (Actions & Notifications) */}
                  <div className="flex items-center gap-4">
                    <Link href="/customers" className="hidden sm:flex bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm items-center gap-2 transition-colors">
                      <Plus size={18} />
                      רשומה חדשה
                    </Link>
                    <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                    <NotificationCenter />
                  </div>
                </header>
                
                <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-20 md:pb-10 no-scrollbar">
                  {children}
                </main>
              </div>
            </div>
            
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

function SidebarWrapper({ children }) {
  return (
    <div className="hidden md:block">
      {children}
    </div>
  );
}
