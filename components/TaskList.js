'use client';

import { useState } from 'react';
import { addTask, toggleTask, deleteTask } from '@/app/actions/customer';
import { ListTodo, Plus, Trash2, Calendar, CheckCircle2, Circle, CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaskList({ customerId, initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [newTitle, setNewTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);
    const toastId = toast.loading('מוסיף משימה...');
    const result = await addTask(customerId, newTitle, dueDate);
    if (result.success) {
      setNewTitle('');
      setDueDate('');
      toast.success('משימה נוספה', { id: toastId });
      window.location.reload(); 
    } else {
      toast.error('שגיאה בהוספת משימה', { id: toastId });
    }
    setLoading(false);
  };

  const handleToggle = async (taskId, currentStatus) => {
    await toggleTask(customerId, taskId, currentStatus);
    window.location.reload();
  };

  const handleDelete = async (taskId) => {
    if (confirm('בטוח שברצונך למחוק משימה זו?')) {
      await deleteTask(customerId, taskId);
      window.location.reload();
    }
  };

  const pendingTasks = tasks.filter(t => !t.isCompleted).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-white dark:border-slate-800 shrink-0">
            <ListTodo size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-1 tracking-tight">
              משימות לקוח
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 py-1 px-2.5 rounded-lg font-bold text-[11px] uppercase tracking-wider">
                {pendingTasks} ממתינות לביצוע
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Modern Add Task Form */}
      <div className="p-6 md:p-8 pb-4">
        <form onSubmit={handleAddTask} className="flex flex-col gap-3">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="מה צריך לעשות עכשיו?" 
              className="w-full p-4 pr-5 rounded-[1.25rem] border-2 border-slate-100 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/50 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold text-slate-700 dark:text-slate-200 transition-all placeholder:text-slate-400 placeholder:font-medium shadow-inner"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col gap-3">
             <div className="relative w-full">
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 pointer-events-none">
                   <CalendarClock size={16} />
                </div>
                <input 
                  type="date" 
                  className="w-full p-3.5 pr-11 rounded-xl border-2 border-slate-100 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/50 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 font-bold text-sm text-slate-600 dark:text-slate-300 transition-all uppercase tracking-wider shadow-inner"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
             </div>
             <button 
               disabled={loading || !newTitle.trim()}
               className="w-full bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/30 active:scale-95 disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-2"
             >
               {loading ? <span className="animate-pulse">שומר...</span> : <><Plus size={20} className="transition-transform duration-300 group-hover:rotate-90" /> <span>הוסף משימה</span></>}
             </button>
          </div>
        </form>
      </div>

      {/* Task List */}
      <div className="p-6 md:p-8 pt-2">
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700/70 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
                <ListTodo className="text-emerald-400 dark:text-emerald-500" size={28} />
              </div>
               <p className="text-slate-500 dark:text-slate-400 font-bold text-sm px-4">אין משימות פתוחות... כרגע.</p>
            </div>
          ) : (
            tasks.sort((a,b) => {
              // Sort uncompleted first, then by date. Completed goes to bottom
              if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
              if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
              if (a.dueDate) return -1;
              return 1;
            }).map((task) => (
              <div key={task._id} className={`group flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${task.isCompleted ? 'bg-slate-50/50 dark:bg-slate-800/20 border-transparent dark:border-transparent opacity-50 hover:opacity-100' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900 hover:shadow-md'}`}>
                <div className="flex items-start gap-4 flex-1">
                  <button 
                    type="button"
                    onClick={() => handleToggle(task._id, task.isCompleted)}
                    className="mt-0.5 shrink-0 text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all focus:outline-none hover:scale-110 active:scale-90"
                  >
                    {task.isCompleted ? <CheckCircle2 size={24} className="fill-emerald-100 dark:fill-emerald-900/50" /> : <Circle size={24} className="text-slate-300 dark:text-slate-600 hover:text-emerald-500 hover:fill-emerald-50/50 dark:hover:fill-emerald-900/20" />}
                  </button>
                  <div className="flex-1 overflow-hidden">
                    <p className={`font-bold transition-all duration-300 truncate pr-1 ${task.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${task.isCompleted ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-transparent' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'}`}>
                           <Calendar size={12} /> עומד ליעד: {new Date(task.dueDate).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pl-1">
                  <button 
                    onClick={() => handleDelete(task._id)}
                    className="shrink-0 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-all p-3 bg-white dark:bg-slate-900 rounded-[14px] hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm border border-slate-100 dark:border-slate-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
