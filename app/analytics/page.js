'use client';

import { useState, useEffect } from 'react';
import { getCustomers } from '@/app/actions/customer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, Users, Target, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getCustomers();
      setCustomers(data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-slate-500 animate-pulse">טוען נתוני אנליטיקה...</div>;

  // Compute metrics
  const totalLeads = customers.length;
  const completedDeals = customers.filter(c => c.status === 'Completed').length;
  const activeDeals = customers.filter(c => c.status === 'In Progress').length;
  const conversionRate = totalLeads ? Math.round((completedDeals / totalLeads) * 100) : 0;

  // Data for Charts
  const pieData = [
    { name: 'חדשים', value: customers.filter(c => c.status === 'New').length },
    { name: 'בטיפול', value: activeDeals },
    { name: 'הושלם (סגור)', value: completedDeals },
  ];
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981'];

  // Dummy monthly data for demo purposes
  const monthlyData = [
    { name: 'ינואר', deals: 4, revenue: 12000 },
    { name: 'פברואר', deals: 7, revenue: 25000 },
    { name: 'מרץ', deals: 12, revenue: 45000 },
    { name: 'אפריל', deals: completedDeals, revenue: completedDeals * 3500 }, // Dynamic based on current
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Activity className="text-purple-500" size={32} />
            ביצועים ואנליטיקה
          </h1>
          <p className="text-slate-500 font-bold mt-2">סקירה מקיפה של נתוני העסקאות והלידים</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "סך כל הלידים", value: totalLeads, icon: <Users size={24} />, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { title: "עסקאות פעילות", value: activeDeals, icon: <Target size={24} />, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { title: "עסקאות שנסגרו", value: completedDeals, icon: <TrendingUp size={24} />, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { title: "אחוז המרה", value: `${conversionRate}%`, icon: <Activity size={24} />, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                    {stat.icon}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.title}</h3>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                </div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-black mb-8 dark:text-white text-slate-800">הכנסות לפי חודש (הדגמה)</h2>
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 8, 8]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-black mb-8 dark:text-white text-slate-800">פילוח סטטוס לידים</h2>
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
