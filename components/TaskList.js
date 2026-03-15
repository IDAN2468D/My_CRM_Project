'use client';

import { useState } from 'react';
import { addTask, toggleTask, deleteTask } from '@/app/actions/customer';

export default function TaskList({ customerId, initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [newTitle, setNewTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);
    const result = await addTask(customerId, newTitle, dueDate);
    if (result.success) {
      setNewTitle('');
      setDueDate('');
      // In a real app, we'd fetch the updated customer or use the updated list from action
      // For UX, let's assume we re-render via revalidatePath, but locally we need a refresh
      window.location.reload(); 
    }
    setLoading(false);
  };

  const handleToggle = async (taskId, currentStatus) => {
    await toggleTask(customerId, taskId, currentStatus);
    window.location.reload();
  };

  const handleDelete = async (taskId) => {
    if (confirm('מחק משימה זו?')) {
      await deleteTask(customerId, taskId);
      window.location.reload();
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span>✅</span> משימות ומעקב (Follow-ups)
      </h2>

      <form onSubmit={handleAddTask} className="flex flex-col gap-3 mb-8 bg-slate-50 p-4 rounded-2xl">
        <input 
          type="text" 
          placeholder="מה צריך לעשות?" 
          className="w-full p-3 rounded-xl border-none bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
        />
        <div className="flex gap-3">
          <input 
            type="date" 
            className="flex-1 p-3 rounded-xl border-none bg-white outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button 
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            {loading ? 'שומר...' : 'הוסף'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-center text-slate-400 italic py-6">אין משימות פתוחות</p>
        ) : (
          tasks.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate)).map((task) => (
            <div key={task._id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${task.isCompleted ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  checked={task.isCompleted} 
                  onChange={() => handleToggle(task._id, task.isCompleted)}
                  className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <p className={`font-bold text-slate-800 ${task.isCompleted ? 'line-through' : ''}`}>{task.title}</p>
                  {task.dueDate && (
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      יעד: {new Date(task.dueDate).toLocaleDateString('he-IL')}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(task._id)}
                className="text-slate-300 hover:text-red-500 transition-colors"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
