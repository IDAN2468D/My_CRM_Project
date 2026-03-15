'use client';

import { useState } from 'react';
import { registerUser } from '@/app/actions/register';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, ArrowRight, CheckCircle2, Waves, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const result = await registerUser(formData);

    if (result.success) {
      toast.success('החשבון נוצר בהצלחה! מועבר להתחברות...');
      setTimeout(() => router.push('/login'), 2000);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-slate-950 font-sans" dir="rtl">
      {/* Right Side: Design */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-bl from-indigo-800 via-blue-700 to-blue-900 relative overflow-hidden order-last">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.1),transparent)]"></div>
        <div className="absolute top-[20%] right-[-10%] w-80 h-80 bg-blue-300/10 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl mb-8 animate-float">
            <UserPlus size={40} className="text-white" />
          </div>
          <h2 className="text-5xl font-black text-white leading-tight tracking-tight mb-6">התחל לנהל כמו מקצוען</h2>
          <p className="text-xl text-blue-100 font-medium leading-relaxed opacity-90 mb-10">
            הצטרף לאלפי עסקים שכבר משתמשים ב-Modern CRM כדי להזניק את המכירות שלהם.
          </p>
          
          <div className="space-y-4">
            {[
              { text: 'ניהול לקוחות חכם ופשוט', icon: <CheckCircle2 size={18} /> },
              { text: 'מערכת התראות בזמן אמת', icon: <CheckCircle2 size={18} /> },
              { text: 'לוח שנה וניהול משימות מתקדם', icon: <CheckCircle2 size={18} /> }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-white/90 bg-white/5 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/10 transform hover:translate-x-1 transition-transform cursor-default">
                <span className="text-blue-300">{item.icon}</span>
                <span className="font-bold">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Left Side: Form */}
      <div className="flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-black text-blue-600 tracking-tighter">MODERN CRM</h1>
          </div>

          <div className="mb-10 lg:text-right text-center">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">יצירת חשבון</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold">הצטרף אלינו בתוך פחות מדקה</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 group">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-1 group-focus-within:text-blue-600 transition-colors">שם מלא</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  name="name"
                  type="text" 
                  required
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none font-bold placeholder:text-slate-400 dark:text-white transition-all shadow-sm"
                  placeholder="ישראל ישראלי"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-1 group-focus-within:text-blue-600 transition-colors">אימייל</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  name="email"
                  type="email" 
                  required
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none font-bold placeholder:text-slate-400 dark:text-white transition-all shadow-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-1 group-focus-within:text-blue-600 transition-colors">סיסמה</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  required
                  minLength={8}
                  className="w-full pr-12 pl-12 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none font-bold placeholder:text-slate-400 dark:text-white transition-all shadow-sm"
                  placeholder="לפחות 8 תווים"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-slate-800 dark:hover:bg-blue-700 transform transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  צור חשבון בחינם
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-slate-500 dark:text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800 pt-8">
            כבר יש לך חשבון?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-black underline underline-offset-4 decoration-2">
              התחבר כאן
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
