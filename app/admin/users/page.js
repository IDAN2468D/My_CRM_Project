'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '@/app/actions/user';
import { useSession } from 'next-auth/react';
import { Shield, Trash2, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) {
      toast.error('אין לך הרשאה לגשת לדף זה');
    }
    setLoading(false);
  }

  const handleRoleChange = async (userId, newRole) => {
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      toast.success('התפקיד עודכן בהצלחה');
      fetchUsers();
    }
  };

  const handleDelete = async (userId) => {
    if (confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) {
      const res = await deleteUser(userId);
      if (res.success) {
        toast.success('המשתמש נמחק');
        fetchUsers();
      } else {
        toast.error('לא ניתן למחוק את עצמך');
      }
    }
  };

  if (loading) return <div className="text-center py-20 dark:text-white font-bold">טוען משתמשים...</div>;
  if (!session || session.user.role !== 'Admin') return <div className="text-center py-20 text-red-500 font-black">גישה חסומה - לאדמינים בלבד</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">ניהול משתמשים</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">נהל הרשאות וגישה למערכת.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest leading-none">משתמש</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest leading-none">אימייל</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest leading-none">תפקיד</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest leading-none">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-black">
                      {user.name.substring(0, 2)}
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{user.email}</td>
                <td className="px-6 py-4">
                  <select 
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="bg-transparent font-black px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  >
                    <option value="Admin">Admin / מנהל</option>
                    <option value="Agent">Agent / סוכן</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleDelete(user._id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="מחק משתמש"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
