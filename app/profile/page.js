'use client';

import { useState, useEffect } from 'react';
import { getUserProfile, updateProfile } from '../actions/user';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const data = await getUserProfile();
      setUser(data);
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccess(false);
    setError('');

    const result = await updateProfile(new FormData(e.target));
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }
    setIsUpdating(false);
  };

  if (!user) return <div className="text-center py-20 dark:text-white">טוען פרופיל...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">פרופיל אישי</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">נהל את פרטי החשבון וההרשאות שלך.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg">
            {user.name.substring(0, 2)}
          </div>
          <div>
            <h2 className="text-2xl font-bold dark:text-white">{user.name}</h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{user.role}</p>
          </div>
        </div>

        {success && <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 p-4 rounded-xl mb-6 font-bold text-sm border border-emerald-100 dark:border-emerald-900">הפרופיל עודכן בהצלחה!</div>}
        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-xl mb-6 font-bold text-sm border border-red-100 dark:border-red-900">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">שם מלא</label>
              <input 
                name="name"
                type="text" 
                defaultValue={user.name}
                className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 outline-none focus:border-blue-500 dark:text-white font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">אימייל</label>
              <input 
                name="email"
                type="email" 
                defaultValue={user.email}
                className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 outline-none focus:border-blue-500 dark:text-white font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">סיסמה חדשה (השאר ריק כדי לא לשנות)</label>
            <input 
              name="newPassword"
              type="password" 
              className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 outline-none focus:border-blue-500 dark:text-white font-bold"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={isUpdating}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {isUpdating ? 'מעדכן...' : 'שמור שינויים'}
          </button>
        </form>
      </div>

      {user.role === 'Admin' && (
        <div className="bg-slate-900 p-8 rounded-3xl text-white border border-slate-800">
          <h2 className="text-xl font-bold mb-2">פאנל ניהול (Admin)</h2>
          <p className="text-slate-400 text-sm mb-6 font-medium">כמנהל מערכת, יש לך גישה למחיקת לקוחות וצפייה בלוגים של כלל המשתמשים.</p>
          <div className="flex gap-4">
            <button className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all">ניהול משתמשים (בקרוב)</button>
            <button className="bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all">צפייה בכל הלוגים</button>
          </div>
        </div>
      )}
    </div>
  );
}
