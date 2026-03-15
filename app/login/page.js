'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        toast.error('אימייל או סיסמה שגויים. נסה שוב.');
      } else {
        toast.success('התחברת בהצלחה! מועבר לדף הבית...');
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      toast.error('אירעה שגיאה זמנית בשרת.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40" dir="rtl">
      {/* Left Side: Illustration & Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/api/placeholder/1920/1080?text=Pattern')] bg-repeat mix-blend-overlay"></div>
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500 group">
            <ShieldCheck size={40} className="text-white group-hover:text-blue-200 transition-colors" />
          </div>
          <h2 className="text-5xl font-black text-white leading-tight tracking-tight mb-6">ברוכים הבאים ל-MODERN CRM</h2>
          <p className="text-xl text-blue-100 font-medium leading-relaxed opacity-90">
            הבית החדש של המכירות והלקוחות שלך. מהיר יותר, חכם יותר ומעוצב במיוחד בשבילך.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-4 text-right">
            <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <p className="text-white font-black text-lg">99.9%</p>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">זמינות מערכת</p>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
              <p className="text-white font-black text-lg">256-bit</p>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">אבטחת נתונים</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl lg:hidden"></div>
        
        <div className="w-full max-w-md relative z-10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-4">
          <div className="lg:hidden text-center mb-10">
              <h1 className="text-3xl font-black text-blue-600 tracking-tighter">MODERN CRM</h1>
          </div>

          <div className="mb-10 lg:text-right text-center">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">התחברות</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold">הזן את פרטי החשבון שלך כדי להמשיך</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-1 group-focus-within:text-blue-600 transition-colors">אימייל</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none font-bold placeholder:text-slate-400 dark:text-white transition-all shadow-sm group-focus-within:shadow-blue-500/10"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest group-focus-within:text-blue-600 transition-colors">סיסמה</label>
                <Link href="#" className="text-xs font-black text-blue-600 hover:text-blue-700 transition-colors">שכחת סיסמה?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  className="w-full pr-12 pl-12 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-2xl outline-none font-bold placeholder:text-slate-400 dark:text-white transition-all shadow-sm group-focus-within:shadow-blue-500/10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group overflow-hidden relative"
            >
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              {loading ? (
                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  כניסה למערכת
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-bold">עדיין אין לך חשבון?</span>
            <Link href="/register" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-black transition-colors group">
              צור חשבון חדש בחינם
              <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
