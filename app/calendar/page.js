'use client';

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { he } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus, Calendar as CalendarIcon, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { getCalendarTasks } from '@/app/actions/customer';
import { getTasks, createTask } from '@/app/actions/taskActions';
import toast from 'react-hot-toast';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: he }),
  getDay,
  locales: { he },
});

export default function PremiumCalendar() {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', date: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      let oldTasks = await getCalendarTasks();
      if (!Array.isArray(oldTasks)) oldTasks = [];
      const mappedOld = oldTasks.map(t => ({
        id: t.id,
        title: t.title,
        start: new Date(t.start),
        end: new Date(t.start),
        allDay: true,
        type: 'Task'
      }));

      let globalT = await getTasks();
      if (!Array.isArray(globalT)) globalT = [];
      const mappedGlobal = globalT.map(t => ({
        id: t._id,
        title: t.customer ? `${t.customer.name}: ${t.title}` : t.title,
        start: new Date(t.dueDate),
        end: new Date(t.dueDate),
        allDay: true,
        type: 'Event'
      }));

      setEvents([...mappedOld, ...mappedGlobal]);
    } catch (e) {
      console.error(e);
      toast.error('שגיאה בטעינת אירועים ללוח השנה');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.date) {
      return toast.error('נא למלא את כל השדות');
    }

    setIsSaving(true);
    const res = await createTask({ 
      title: newTask.title, 
      dueDate: newTask.date, 
      status: 'Pending' 
    });

    if (res.success) {
      toast.success('הפגישה/המשימה נשמרה בלוח!');
      setIsModalOpen(false);
      setNewTask({ title: '', date: '' });
      loadEvents();
    } else {
      toast.error('שגיאה בשמירת הפגישה');
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Header aligned with Nozti CRM image style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-2 gap-4">
        <div className="flex items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">לוח שנה</h1>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        
        {/* Main Calendar View */}
        <div className="flex-1 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px] overflow-hidden w-full lg:w-auto">
          <style>{`
            .rbc-calendar { direction: rtl; min-width: 600px; }
            .rbc-header { padding: 12px; font-weight: bold; color: #64748b; font-size: 14px; text-transform: uppercase; border-bottom: none!important; }
            .rbc-month-view { border: none !important; }
            .rbc-day-bg { border: 1px dashed #f1f5f9; }
            .rbc-today { background: #f8fafc !important; }
            .rbc-event { background: #fef3c7; color: #d97706; border-radius: 8px; padding: 4px 8px; font-weight: 500; border: 1px solid #fde68a; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
            /* Mocking some event colors assuming the image's multi-colored events */
            .rbc-event:nth-child(even) { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
            .rbc-event:nth-child(3n) { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
            
            .rbc-toolbar { display: flex; justify-content: space-between; margin-bottom: 20px !important; }
            .rbc-toolbar button { font-weight: bold; border-radius: 8px; border: 1px solid #e2e8f0; color: #475569; padding: 6px 14px; }
            .rbc-toolbar button:hover { background: #f8fafc; }
            .rbc-active { background: #10b981 !important; color: white !important; border-color: #10b981 !important; }
            .rbc-toolbar .rbc-btn-group { display: flex; gap: 4px; }
            .rbc-month-row { border-top: 1px dashed #f1f5f9; }
          `}</style>
          
          <div className="overflow-x-auto overflow-y-hidden w-full pb-4">
            <Calendar
              localizer={localizer}
              events={events}
              style={{ height: 650 }}
              culture="he"
              messages={{
                next: "הבא", previous: "הקודם", today: "היום", month: "חודש", week: "שבוע", day: "יום", agenda: "סדר יום"
              }}
              rtl={true}
              defaultView='week'
              views={['month', 'week', 'day']}
            />
          </div>
        </div>

        {/* Right Sidebar Filters Setup */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
            
            {/* Mock Mini Calendar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
               <div className="flex justify-between items-center mb-4">
                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><ChevronRight size={18}/></button>
                  <span className="font-bold text-slate-800 dark:text-white">נובמבר 2023</span>
                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><ChevronLeft size={18}/></button>
               </div>
               <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                 <div>א'</div><div>ב'</div><div>ג'</div><div>ד'</div><div>ה'</div><div>ו'</div><div>ש'</div>
               </div>
               <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
                  <div className="py-2 text-slate-300">30</div>
                  <div className="py-2 text-slate-300">31</div>
                  <div className="py-2">1</div>
                  <div className="py-2">2</div>
                  <div className="py-2">3</div>
                  <div className="py-2">4</div>
                  <div className="py-2">5</div>
                  
                  <div className="py-2">6</div>
                  <div className="py-2 relative">7<span className="absolute bottom-1 right-1/2 translate-x-1/2 w-1 h-1 bg-red-400 rounded-full"></span></div>
                  <div className="py-2">8</div>
                  <div className="py-2 relative">9<span className="absolute bottom-1 right-1/2 translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></span></div>
                  <div className="py-2">10</div>
                  <div className="py-2 bg-slate-100 dark:bg-slate-800 rounded-full font-bold">11</div>
                  <div className="py-2">12</div>
                  
                  <div className="py-2">13</div>
                  <div className="py-2">14</div>
                  <div className="py-2">15</div>
                  <div className="py-2">16</div>
                  <div className="py-2">17</div>
                  <div className="py-2 text-red-500">18</div>
                  <div className="py-2">19</div>
                  
                  <div className="py-2 bg-emerald-500 text-white rounded-full font-bold shadow-md shadow-emerald-500/30">20</div>
                  <div className="py-2 text-slate-400">21</div>
                  <div className="py-2">22</div>
                  <div className="py-2">23</div>
                  <div className="py-2 relative">24<span className="absolute bottom-1 right-1/2 translate-x-1/2 flex gap-0.5"><div className="w-1 h-1 bg-orange-400 rounded-full"></div><div className="w-1 h-1 bg-orange-400 rounded-full"></div></span></div>
                  <div className="py-2">25</div>
                  <div className="py-2">26</div>
               </div>
            </div>

            {/* Activity Types Filter */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h4 className="font-bold text-slate-800 dark:text-white mb-4">סוגי פעילות</h4>
                <div className="space-y-3">
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">שיחות</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">אירועים</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">משימות</span>
                   </label>
                </div>
            </div>

            {/* Ownership Filter */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h4 className="font-bold text-slate-800 dark:text-white mb-4">בעלות</h4>
                <div className="space-y-3">
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="ownership" defaultChecked className="w-4 h-4 text-emerald-500 border-slate-300 focus:ring-emerald-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">הפעילויות שלי</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="ownership" className="w-4 h-4 text-emerald-500 border-slate-300 focus:ring-emerald-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">פעילויות צוות</span>
                   </label>
                </div>
            </div>

            {/* Status Filter */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h4 className="font-bold text-slate-800 dark:text-white mb-4">סטטוס</h4>
                <div className="space-y-3">
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="status" defaultChecked className="w-4 h-4 text-emerald-500 border-slate-300 focus:ring-emerald-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">פתוח</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="status" className="w-4 h-4 text-emerald-500 border-slate-300 focus:ring-emerald-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">סגור</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="status" className="w-4 h-4 text-emerald-500 border-slate-300 focus:ring-emerald-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">הכל</span>
                   </label>
                </div>
            </div>

        </div>

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">משימה חדשה</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <X size={24} />
              </button>
            </div>
            <form className="space-y-4 text-right" onSubmit={handleSave}>
                <input 
                  type="text" 
                  placeholder="נושא המשימה או הפגישה" 
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                />
                <input 
                  type="date" 
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newTask.date}
                  onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                  required
                />
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'שומר במערכת...' : 'שמור בלוח השנה'}
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
