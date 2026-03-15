'use client';

import { useState, useEffect } from 'react';
import { getComparativeStats } from '@/app/actions/dashboard';
import { Users, Target, CheckCircle2, ListTodo, Activity, ChevronLeft } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock Data for Charts (Based on user request)
const MOCK_GROWTH_DATA = [
  { name: 'אוק', value: 45 },
  { name: 'נוב', value: 52 },
  { name: 'דצמ', value: 38 },
  { name: 'ינו', value: 65 },
  { name: 'פבר', value: 84 },
  { name: 'מרץ', value: 120 },
];

const MOCK_ACTIVITY = [
  { id: 1, user: 'עידן מ.', action: 'עדכן סטטוס לקוח', target: 'חברת הייטק בע"מ', time: 'לפני 10 דקות', color: 'text-blue-500 bg-blue-50' },
  { id: 2, user: 'שרה כ.', action: 'הוסיפה לקוח חדש', target: 'משה כהן', time: 'לפני שעה', color: 'text-emerald-500 bg-emerald-50' },
  { id: 3, user: 'יוסי ב.', action: 'סגר עסקה עם', target: 'דניאל מערכות', time: 'לפני 3 שעות', color: 'text-indigo-500 bg-indigo-50' },
  { id: 4, user: 'אדמין א.', action: 'שייך משימה ל-', target: 'חברת הייטק בע"מ', time: 'אתמול', color: 'text-amber-500 bg-amber-50' },
];

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function loadStats() {
      const data = await getComparativeStats();
      setStats(data);
    }
    loadStats();
  }, []);

  const downloadPDF = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    
    setIsExporting(true);
    const toastId = toast.loading('מכין דוח PDF להורדה...');

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('CRM_Dashboard_Report.pdf');
      toast.success('דוח PDF נשמר בהצלחה', { id: toastId });
    } catch (error) {
      toast.error('שגיאה ביצירת הדוח', { id: toastId });
    }
    setIsExporting(false);
  };

  if (!stats) return (
    <div className="flex items-center justify-center min-h-[60vh] text-slate-400 font-bold animate-pulse">
      טוען נתוני מערכת...
    </div>
  );

  const activeLeads = stats.statsByStatus?.find(s => s.name === 'בטיפול')?.value || 0;
  const conversionRate = stats.total > 0 ? Math.round((stats.completed / (stats.total || 1)) * 100) : 0;
  
  // Custom tooltips for Recharts to support RTL and right alignment
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl space-y-2 dir-rtl text-right">
          <p className="font-black text-slate-900 dark:text-white">{label}</p>
          <p className="text-blue-600 font-bold">{`לקוחות: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="dashboard-content" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 bg-slate-50 dark:bg-slate-950 p-2 lg:p-4 rounded-3xl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">שלום,<br/>זה המצב היום 👋</h1>
        </div>
        <button 
          onClick={downloadPDF}
          disabled={isExporting}
          data-html2canvas-ignore="true"
          className="bg-white dark:bg-slate-800 text-slate-700 dark:text-white px-6 py-3 rounded-2xl font-black shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          {isExporting ? 'מייצא דוח...' : '📄 הורד דוח PDF'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="סה״כ לקוחות" 
          value={stats.total} 
          trend={stats.totalChange !== 0 ? `${stats.totalChange > 0 ? '+' : ''}${stats.totalChange}% לעומת חודש שעבר` : 'ללא שינוי'} 
          trendUp={stats.totalChange >= 0} 
          icon={Users} 
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" 
        />
        <StatCard 
          title="לידים פעילים" 
          value={activeLeads} 
          trend="+5% היום" 
          trendUp={true} 
          icon={Target} 
          colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" 
        />
        <StatCard 
          title="יחס המרה" 
          value={`${conversionRate}%`} 
          trend={stats.completionChange !== 0 ? `${stats.completionChange > 0 ? '+' : ''}${stats.completionChange}% לעומת חודש שעבר` : 'ללא שינוי'} 
          trendUp={stats.completionChange >= 0} 
          icon={CheckCircle2} 
          colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
        />
        <StatCard 
          title="משימות להיום" 
          value="18" 
          icon={ListTodo} 
          colorClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" 
        />
      </div>

      {/* Analytics & Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Charts (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors"></div>
            
            <div className="flex justify-between items-end mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">צמיחת לקוחות</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-1">מגמה בחצי השנה האחרונה</p>
              </div>
            </div>

            <div className="h-[300px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', opacity: 0.4 }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40}>
                    {MOCK_GROWTH_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === MOCK_GROWTH_DATA.length - 1 ? '#3b82f6' : '#93c5fd'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-6">התפלגות סטטוסים</h3>
                <div className="h-[200px]" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.statsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {stats.statsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  {stats.statsByStatus.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                       <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{s.name}</span>
                    </div>
                  ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-[url('/api/placeholder/400/300?text=Pattern')] opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10">
                 <div className="p-3 bg-white/20 backdrop-blur w-fit rounded-2xl mb-6">
                    <Activity size={24} />
                 </div>
                 <h3 className="text-2xl font-black leading-tight mb-2">מוכנים לשלב הבא?</h3>
                 <p className="text-emerald-50 text-sm font-medium leading-relaxed">שדרג למערכת ה-Pro וקבל תובנות AI מתקדמות על תיק הלקוחות שלך.</p>
              </div>
              <button className="relative z-10 w-full mt-6 bg-white text-emerald-600 py-3 rounded-xl font-black hover:bg-emerald-50 transition-colors flex justify-center items-center gap-2">
                 שדרג עכשיו
                 <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity List (Side column) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm h-full">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-8">יומן פעילות אחרונה</h3>
            
            <div className="relative border-r-2 border-slate-100 dark:border-slate-800 pr-6 space-y-8">
              {MOCK_ACTIVITY.map((activity, index) => (
                <div key={activity.id} className="relative">
                  <span className={`absolute -right-[33px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 ${activity.color.split(' ')[1].replace('bg-', 'bg-').replace('50', '500')}`}></span>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl transform hover:-translate-x-1 transition-transform cursor-default">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{activity.user}</span>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap mr-2">{activity.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {activity.action} <span className="font-bold text-slate-900 dark:text-white">{activity.target}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-3 text-sm font-black text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-colors uppercase tracking-widest">
              צפה בכל הפעולות
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
