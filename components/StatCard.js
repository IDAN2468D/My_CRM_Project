'use client';

export default function StatCard({ title, value, trend, trendUp, icon: Icon, colorClass }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-2xl ${colorClass} transition-transform group-hover:scale-110`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        {trend && (
          <span className={`text-sm font-black px-3 py-1 rounded-full flex items-center gap-1 ${
            trendUp 
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
              : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
          }`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest">{title}</h3>
        <p className="text-4xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
