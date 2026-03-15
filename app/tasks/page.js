'use client';

import { useState, useEffect } from 'react';
import { getTasks, updateTaskStatus } from '@/app/actions/taskActions';
import { CheckCircle2, Clock, CheckSquare, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await getTasks();
    setTasks(data || []);
    setLoading(false);
  };

  const handleStatusChange = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    
    // Optimistic UI update
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    
    const res = await updateTaskStatus(taskId, newStatus);
    if (res.success) {
      toast.success(newStatus === 'Completed' ? 'משימה הושלמה!' : 'משימה חזרה לטיפול');
    } else {
      toast.error('שגיאה בעדכון משימה');
      loadTasks(); // Revert
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-500 animate-pulse">טוען נתונים...</div>;

  const pendingTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <CheckSquare className="text-blue-500" size={32} />
            ניהול משימות
          </h1>
          <p className="text-slate-500 font-bold mt-2">מעקב אחר החזרות, פגישות ויעדים</p>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          onClick={() => {
              // This can open a modal in the future
              toast.error('יצירת משימה חדשה תתווסף בקרוב!'); 
          }}
        >
          <Plus size={20} />
          משימה חדשה
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-100">
             <Clock className="text-amber-500" />
             משימות פתוחות ({pendingTasks.length})
          </h2>
          
          <div className="space-y-4">
             {pendingTasks.length === 0 ? (
                 <p className="text-slate-500 italic text-center py-10">אין משימות פתוחות. עבודה טובה!</p>
             ) : (
                pendingTasks.map(task => (
                    <div key={task._id} className="group border border-slate-100 dark:border-slate-800 p-5 rounded-3xl flex justify-between items-center hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => handleStatusChange(task._id, task.status)}
                                className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center hover:border-blue-500 group-hover:scale-110 transition-all focus:outline-none"
                            >
                                <div className="w-3 h-3 rounded-full bg-blue-500 opacity-0 group-hover:opacity-20"></div>
                            </button>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-200">{task.title}</h3>
                                {task.customer && <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">{task.customer.name}</span>}
                                {task.description && <p className="text-sm text-slate-500 mt-1">{task.description}</p>}
                                <p className="text-xs text-red-500 font-bold mt-2">
                                    יעד: {new Date(task.dueDate).toLocaleDateString('he-IL')}
                                </p>
                            </div>
                        </div>
                    </div>
                ))
             )}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 opacity-75">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-slate-500">
             <CheckCircle2 className="text-emerald-500" />
             הושלמו לאחרונה
          </h2>
          <div className="space-y-4">
              {completedTasks.length === 0 ? (
                  <p className="text-slate-500 italic text-center py-10">טרם הושלמו משימות.</p>
              ) : (
                 completedTasks.map(task => (
                    <div key={task._id} className="border border-slate-100 dark:border-slate-800 p-5 rounded-3xl flex items-center gap-4 opacity-70">
                        <button 
                            onClick={() => handleStatusChange(task._id, task.status)}
                            className="text-emerald-500 hover:text-slate-400 transition-colors"
                        >
                            <CheckCircle2 size={24} />
                        </button>
                        <div className="line-through text-slate-500">
                            <h3 className="font-bold">{task.title}</h3>
                            <p className="text-xs mt-1">
                                הושלם ב: {new Date(task.updatedAt).toLocaleDateString('he-IL')}
                            </p>
                        </div>
                    </div>
                ))
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
