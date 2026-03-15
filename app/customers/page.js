'use client';

import { useState, useEffect } from 'react';
import { getCustomers, addCustomer, deleteCustomer } from '../actions/customer';
import { processMagicInput } from '@/app/actions/magicInput';
import Link from 'next/link';
import { downloadCSV } from '@/lib/csvExport';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { User, Phone, Mail, Sparkles } from 'lucide-react';

export default function CustomersPage() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Standard Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  // Magic Input State
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [magicText, setMagicText] = useState('');
  const [isProcessingMagic, setIsProcessingMagic] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter]);

  const fetchData = async () => {
    const data = await getCustomers(search, statusFilter);
    setCustomers(data);
  };

  const handleExport = () => {
    downloadCSV(customers);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formMeta = new FormData();
    formMeta.append('name', formData.name);
    formMeta.append('phone', formData.phone);
    formMeta.append('email', formData.email);
    formMeta.append('status', 'New');

    const result = await addCustomer(formMeta);
    if (result.success) {
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', email: '' });
      toast.success('לקוח נוצר בהצלחה');
      fetchData();
    } else {
      toast.error(result.error || 'שגיאה ביצירת הלקוח');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm('מחק לקוח זה מהמערכת?')) {
      const result = await deleteCustomer(id);
      if (result.success) {
        toast.success('לקוח נמחק בהצלחה');
        fetchData();
      }
    }
  };

  const handleMagicSubmit = async () => {
    if (!magicText.trim()) return toast.error('נא להזין טקסט');
    
    setIsProcessingMagic(true);
    const res = await processMagicInput(magicText);
    setIsProcessingMagic(false);
    
    if (res.success && res.data) {
       setFormData({
         name: res.data.name || '',
         phone: res.data.phone || '',
         email: res.data.email || ''
       });
       setIsMagicModalOpen(false);
       setMagicText('');
       setIsModalOpen(true); // Open the standard form for review
       toast.success('הפרטים חולצו בהצלחה ע"י AI!');
    } else {
       toast.error(res.error || 'שגיאה בפענוח הטקסט. בדוק שהזנת מפתח API תקין בהגדרות.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ספר לקוחות</h1>
          <p className="text-slate-500 text-sm md:text-base">נהל את רשימת הלקוחות והעסקאות שלך.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <button 
            onClick={handleExport}
            className="w-full sm:w-auto bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <span>📥</span> ייצוא לאקסל
          </button>
          
          <button 
            onClick={() => setIsMagicModalOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <span>✨</span> הוספת קסם AI
          </button>

          <button 
            onClick={() => { setFormData({name: '', phone: '', email: ''}); setIsModalOpen(true); }}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <span>➕</span> הוסף לקוח
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1 min-w-0">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">🔍</span>
          <input 
            type="text" 
            placeholder="חפש לפי שם או טלפון..." 
            className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm md:text-base font-medium text-slate-900 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm md:text-base w-full sm:w-auto text-slate-900 dark:text-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">כל הסטטוסים</option>
          <option value="New">חדש</option>
          <option value="In Progress">בטיפול</option>
          <option value="Completed">הושלם</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-right border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400">שם מלא</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400">אימייל / טלפון</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400">סטטוס</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400">תאריך פתיחה</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 text-left">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {customers.map((c) => (
                <tr 
                  key={c._id} 
                  onClick={() => window.location.href = `/customers/${c._id}`}
                  className="hover:bg-blue-50/30 dark:hover:bg-slate-800 transition-all cursor-pointer group"
                >
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-800 dark:text-white">{c.name}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-slate-600 dark:text-slate-300 font-medium">{c.phone}</p>
                    <p className="text-slate-400 text-xs">{c.email || '-'}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                      c.status === 'New' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' :
                      c.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' :
                      'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-sm">
                    {new Date(c.createdAt).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-6 py-4 text-left">
                    {session?.user?.role === 'Admin' && (
                      <button 
                        onClick={(e) => handleDelete(e, c._id)}
                        className="text-slate-300 hover:text-red-500 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 p-2"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-slate-400 italic font-medium">לא נמצאו לקוחות תואמים</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Magic AI Input Modal */}
      {isMagicModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-black flex items-center gap-2">
                <span>✨</span> הוספת ליד חכמה ב-AI
              </h2>
              <button disabled={isProcessingMagic} onClick={() => setIsMagicModalOpen(false)} className="text-white/70 hover:text-white text-3xl transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">הדבק כאן טקסט חופשי (למשל הודעת ווטסאפ או אימייל). המערכת המלאכותית שלנו תחלץ עבורך את השם, הטלפון והאימייל אוטומטית.</p>
              <textarea 
                className="w-full h-40 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 resize-none text-slate-900 dark:text-white font-medium" 
                placeholder="למשל: דני צבי התקשר אליי, הטלפון שלו זה 050-1234567..."
                value={magicText}
                onChange={(e) => setMagicText(e.target.value)}
                autoFocus
              />
              <button 
                onClick={handleMagicSubmit}
                disabled={isProcessingMagic || !magicText}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-purple-500/20 hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isProcessingMagic ? (
                  <><span>⏳</span> המודל מנתח את הטקסט...</>
                ) : (
                  <><span>⚡</span> חלץ נתונים</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regular Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">לקוח חדש</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">הזן פרטי לקוח באופן ידני או בעזרת AI</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:shadow-md transition-all font-black text-xl hover:scale-105">&times;</button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[80vh] w-full">
              {/* AI Magic Banner inside the form */}
              <div 
                onClick={() => { setIsModalOpen(false); setIsMagicModalOpen(true); }}
                className="mb-8 p-[2px] rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 cursor-pointer hover:shadow-lg hover:shadow-purple-500/20 transition-all hover:-translate-y-0.5"
              >
                <div className="bg-white dark:bg-slate-900 rounded-[14px] px-6 py-4 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                         <Sparkles size={24} />
                      </div>
                      <div>
                         <h3 className="font-black text-slate-900 dark:text-white text-lg">Fast Track - קסם AI</h3>
                         <p className="text-sm font-medium text-slate-500">הדבק טקסט חופשי והמערכת תמלא הכל עבורך</p>
                      </div>
                   </div>
                   <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 font-bold px-4 py-2 rounded-lg text-sm transition-colors group-hover:bg-purple-200">
                      נסה עכשיו
                   </span>
                </div>
              </div>

              <form onSubmit={handleAdd} className="space-y-8 text-right">
                
                {/* Section: Contact Info */}
                <div className="space-y-5">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">פרטי התקשרות יסודיים</h4>
                  
                  <div className="relative group">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">שם חדש (חובה)</label>
                    <div className="relative">
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <User size={20} />
                      </div>
                      <input 
                        required 
                        className="w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900/50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium dark:text-white transition-all text-lg shadow-sm" 
                        placeholder="לדוגמה: ישראל ישראלי"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative group">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">טלפון (חובה)</label>
                      <div className="relative">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                          <Phone size={20} />
                        </div>
                        <input 
                          required 
                          className="w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900/50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium dark:text-white transition-all text-lg text-left shadow-sm" 
                          dir="ltr"
                          placeholder="050-1234567"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">אימייל (אופציונלי)</label>
                      <div className="relative">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                          <Mail size={20} />
                        </div>
                        <input 
                          type="email"
                          className="w-full pr-12 pl-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900/50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium dark:text-white transition-all text-lg text-left shadow-sm" 
                          dir="ltr"
                          placeholder="mail@ex.co.il"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-8">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-slate-900/20 dark:shadow-indigo-500/20 hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 text-lg flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        שומר במערכת...
                      </>
                    ) : 'מלא פרטים ושמור לקוח'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
