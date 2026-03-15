'use client';

import { useState, useEffect } from 'react';
import { getUserSettings, updateUserSettings } from '@/app/actions/settings';
import { Settings, UserCircle, Key, Moon, Sun, Monitor, AlertCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({ name: '', email: '', password: '', geminiApiKey: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    async function loadData() {
      const res = await getUserSettings();
      if (res.success && res.user) {
        setUser({
          name: res.user.name || '',
          email: res.user.email || '',
          geminiApiKey: res.user.geminiApiKey || '',
          password: ''
        });
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateUserSettings(user);
    if (res.success) {
      toast.success('ההגדרות נשמרו בהצלחה!');
      setUser(prev => ({ ...prev, password: '' })); // clear password field
    } else {
      toast.error(res.error || 'שגיאה בשמירה');
    }
    setIsSaving(false);
  };

  if (loading) return <div className="p-10 font-bold text-center text-slate-400 animate-pulse">טוען הגדרות...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10" dir="rtl">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Settings size={24} />
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">הגדרות מתקדמות</h1>
                <p className="text-slate-500 font-bold text-sm">נהל את החשבון והעדפות המערכת שלך</p>
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Settings Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
           <button 
             onClick={() => setActiveTab('profile')}
             className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
           >
             <UserCircle size={20} />
             פרופיל אישי
           </button>
           <button 
             onClick={() => setActiveTab('preferences')}
             className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'preferences' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
           >
             <Monitor size={20} />
             העדפות תצוגה
           </button>
           <button 
             onClick={() => setActiveTab('ai')}
             className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'ai' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
           >
             <Key size={20} />
             אינטגרציות AI
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8">
           
           {activeTab === 'profile' && (
             <form onSubmit={handleSave} className="space-y-6">
               <h3 className="text-xl font-black mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">הגדרות חשבון</h3>
               <div className="space-y-4 max-w-md">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">שם מלא</label>
                   <input 
                     type="text" 
                     value={user.name} 
                     onChange={(e) => setUser(prev => ({...prev, name: e.target.value}))}
                     required
                     className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none" 
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">כתובת אימייל</label>
                   <input 
                     type="email" 
                     value={user.email} 
                     onChange={(e) => setUser(prev => ({...prev, email: e.target.value}))}
                     required
                     className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none" 
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">סיסמה חדשה (השאר ריק אם לא תרצה לשנות)</label>
                   <input 
                     type="password" 
                     value={user.password} 
                     onChange={(e) => setUser(prev => ({...prev, password: e.target.value}))}
                     className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none" 
                   />
                 </div>
               </div>
               <div className="pt-6">
                 <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors disabled:opacity-50">
                   {isSaving ? 'שומר...' : 'שמור שינויים'}
                 </button>
               </div>
             </form>
           )}

           {activeTab === 'preferences' && (
             <div className="space-y-6">
               <h3 className="text-xl font-black mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">העדפות תצוגה / ערכת נושא</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <button 
                   onClick={() => setTheme('light')}
                   className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-colors ${theme === 'light' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                 >
                   <Sun size={32} className={theme === 'light' ? 'text-blue-500' : 'text-slate-400'} />
                   <span className="font-bold">מצב בהיר</span>
                 </button>
                 
                 <button 
                   onClick={() => setTheme('dark')}
                   className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-colors ${theme === 'dark' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                 >
                   <Moon size={32} className={theme === 'dark' ? 'text-blue-500' : 'text-slate-400'} />
                   <span className="font-bold">מצב כהה</span>
                 </button>

                 <button 
                   onClick={() => setTheme('system')}
                   className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-colors ${theme === 'system' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                 >
                   <Monitor size={32} className={theme === 'system' ? 'text-blue-500' : 'text-slate-400'} />
                   <span className="font-bold">תואם למערכת</span>
                 </button>
               </div>
             </div>
           )}

           {activeTab === 'ai' && (
             <form onSubmit={handleSave} className="space-y-6">
               <h3 className="text-xl font-black mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">הגדרות Google Gemini AI</h3>
               
               <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex gap-3 text-blue-700 dark:text-blue-300">
                  <AlertCircle className="shrink-0 mt-0.5" size={20} />
                  <p className="text-sm font-medium">המפתח שלך נשמר בצורה מאובטחת בסביבת המשתמש שלך. הוא ישמש לפיצ'רים כמו הוספת לידים מקסם (Magic Input) וסיכומי שיחות.</p>
               </div>

               <div className="space-y-4 max-w-xl">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gemini API Key</label>
                   <input 
                     type="text" 
                     placeholder="AIzaSy..."
                     value={user.geminiApiKey} 
                     onChange={(e) => setUser(prev => ({...prev, geminiApiKey: e.target.value}))}
                     className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none text-left" 
                     dir="ltr"
                   />
                 </div>
               </div>
               
               <div className="pt-6">
                 <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors disabled:opacity-50">
                   {isSaving ? 'שומר מפתח...' : 'שמור הגדרות AI'}
                 </button>
               </div>
             </form>
           )}

        </div>
      </div>
    </div>
  );
}
