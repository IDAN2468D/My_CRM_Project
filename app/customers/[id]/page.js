'use client';

import { use, useState, useEffect } from 'react';
import { getCustomerById, updateCustomerStatus, addNote, uploadDocument, deleteDocument } from '../../actions/customer';
import Link from 'next/link';
import TaskList from '@/components/TaskList';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { Download, FileText, Upload, Trash2, Receipt, Phone, Mail, User, Sparkles, MessageCircle, Clock, ShieldCheck, Activity, Send, History } from 'lucide-react';

export default function CustomerProfilePage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [draftedMessage, setDraftedMessage] = useState('');
  const [isGeneratingWA, setIsGeneratingWA] = useState(false);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  async function loadCustomer() {
    const data = await getCustomerById(id);
    setCustomer(data);
    setLoading(false);
  }

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    await updateCustomerStatus(id, newStatus);
    await loadCustomer();
    setIsUpdating(false);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsUpdating(true);
    await addNote(id, newNote);
    setNewNote('');
    await loadCustomer();
    setIsUpdating(false);
  };

  const onFileDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      return toast.error('הקובץ גדול מדי (מקס׳ 15MB)');
    }
    
    const toastId = toast.loading('מעלה קובץ לתיקיית Google Drive של הלקוח...');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customerId', id);
    formData.append('customerName', customer.name);

    try {
      const res = await fetch('/api/upload', {
         method: 'POST',
         body: formData,
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
         toast.success('הקובץ נשמר בהצלחה בדרייב!', { id: toastId });
         loadCustomer();
      } else {
         toast.error(data.error || 'שגיאה בשמירת מסמך', { id: toastId });
      }
    } catch(err) {
      toast.error('שגיאה בתקשורת עם שרת האחסון', { id: toastId });
    }
  };

  const generateInvoice = () => {
    const toastId = toast.loading('מפיק מסמך הצעת מחיר (PDF)...');
    setTimeout(() => {
        const doc = new jsPDF();
        // Fallback to latin characters since default jspdf fonts dont support native hebrew TTF
        doc.setFontSize(22);
        doc.text('INVOICE / QUOTE', 20, 20);
        doc.setFontSize(12);
        doc.text(`Customer Name: ${customer.name}`, 20, 40);
        doc.text(`Phone: ${customer.phone}`, 20, 50);
        doc.text(`Email: ${customer.email || 'N/A'}`, 20, 60);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
        doc.text(`Status: ${customer.status}`, 20, 80);
        
        doc.line(20, 90, 190, 90);
        doc.text('Description', 20, 100);
        doc.text('Amount', 160, 100);
        doc.text('CRM Services & Consulting', 20, 110);
        doc.text('$1,250.00', 160, 110);
        doc.line(20, 120, 190, 120);
        
        doc.setFontSize(14);
        doc.text('TOTAL: $1,250.00', 140, 130);

        doc.save(`Invoice_${customer.name}.pdf`);
        toast.success('מסמך הורד בהצלחה!', { id: toastId });
    }, 1500);
  };

  if (loading) return <div className="text-center py-20 dark:text-white">טוען פרופיל לקוח...</div>;
  if (!customer) return <div className="text-center py-20 dark:text-white">לקוח לא נמצא</div>;

  return (
    <div className="w-full mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500 pb-20 px-4 xl:px-12">
      {/* Header Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
        <Link href="/customers" className="hover:text-blue-600 transition-colors">לקוחות</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white">{customer.name}</span>
      </div>

      {/* Premium Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 relative z-10 overflow-hidden">
        {/* Subtle decorative cover */}
        <div className="h-32 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 w-full absolute top-0 left-0"></div>
        
        <div className="p-8 pt-12 relative z-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-end gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/30 border-4 border-white dark:border-slate-900 shrink-0">
              <User size={40} strokeWidth={2.5} />
            </div>
            <div className="pb-1">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">{customer.name}</h1>
              <div className="flex flex-wrap gap-4 font-semibold text-slate-500 dark:text-slate-400 text-sm">
                <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                   <Phone size={14} className="text-blue-500" /> <span dir="ltr">{customer.phone}</span>
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                     <Mail size={14} className="text-blue-500" /> <span dir="ltr">{customer.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto mt-4 md:mt-0 pb-1">
            <div className="flex bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
               <button 
                 onClick={generateInvoice}
                 className="flex-1 md:flex-none px-5 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-bold shadow-sm border border-slate-200 dark:border-slate-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
               >
                 <Receipt size={16} /> הפק הצעת מחיר
               </button>
            </div>
            
            <div className="relative group min-w-[200px]">
              <div className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 pointer-events-none">
                 <Activity size={16} />
              </div>
              <select 
                disabled={isUpdating}
                value={customer.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`w-full appearance-none pr-10 pl-4 py-3 rounded-2xl font-black text-sm outline-none transition-all shadow-sm border cursor-pointer ${
                  customer.status === 'New' ? 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-900/50' :
                  customer.status === 'Completed' ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-900/50' :
                  'text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/30 dark:border-orange-900/50'
                }`}
              >
                <option value="New">סטטוס משימה: חדש</option>
                <option value="In Progress">סטטוס משימה: בטיפול</option>
                <option value="Completed">סטטוס משימה: הושלם</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Floating Premium Tabs */}
          <div className="bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl flex flex-wrap lg:flex-nowrap gap-1">
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex-1 min-w-[120px] py-3 px-4 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'notes' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <FileText size={16} className={activeTab === 'notes' ? 'text-blue-500' : ''} />
              פעילות והערות
            </button>
            <button 
              onClick={() => setActiveTab('audit')}
              className={`flex-1 min-w-[120px] py-3 px-4 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'audit' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <ShieldCheck size={16} className={activeTab === 'audit' ? 'text-emerald-500' : ''} />
              לוג שינויים
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className={`flex-1 min-w-[120px] py-3 px-4 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'documents' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Download size={16} className={activeTab === 'documents' ? 'text-indigo-500' : ''} />
              מסמכים <span className={`mr-1 px-2 py-0.5 rounded-md text-xs ${activeTab === 'documents' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>{customer.documents?.length || 0}</span>
            </button>
          </div>

          {activeTab === 'notes' ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <h2 className="text-xl font-black flex items-center gap-3 dark:text-white">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 flex items-center justify-center">
                    <MessageCircle size={20} />
                  </div>
                  יומן פעילות והערות
                </h2>
              </div>
              
              <div className="p-8">
                <form onSubmit={handleAddNote} className="mb-10 relative group">
                  <textarea 
                    placeholder="הקלק כאן כדי לכתוב הערה או עדכון חדש..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 rounded-2xl p-5 pb-16 min-h-[140px] outline-none transition-all font-medium dark:text-white resize-none shadow-inner"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <div className="absolute left-4 bottom-4">
                    <button 
                      disabled={isUpdating || !newNote.trim()}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                    >
                      {isUpdating ? 'שומר...' : <><Send size={16} /> שליחה</>}
                    </button>
                  </div>
                </form>

                <div className="space-y-6">
                  {customer.notes.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <MessageCircle className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
                      <p className="text-slate-500 dark:text-slate-400 font-medium">עוד אין פה כלום. הוסף את ההערה הראשונה ללקוח!</p>
                    </div>
                  ) : (
                    <div className="relative before:absolute before:inset-y-0 before:right-[15px] before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 space-y-8">
                      {customer.notes.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((note, idx) => (
                        <div key={idx} className="relative pr-10 hover:-translate-x-1 transition-transform">
                          <div className="absolute right-0 top-1 w-[32px] h-[32px] rounded-full bg-blue-100 text-blue-600 dark:bg-slate-800 dark:text-blue-400 flex items-center justify-center border-4 border-white dark:border-slate-900 z-10 shadow-sm">
                            <FileText size={12} />
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl rounded-tr-none border border-slate-100 dark:border-slate-700/50">
                            <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">{note.text}</p>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Clock size={12} /> {new Date(note.createdAt).toLocaleString('he-IL')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'audit' ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <h2 className="text-xl font-black flex items-center gap-3 dark:text-white">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  חירום וביקורת (לוג פעולות)
                </h2>
              </div>
              <div className="p-8 space-y-4">
                {customer.auditLogs && customer.auditLogs.length > 0 ? (
                  customer.auditLogs.map((log) => (
                    <div key={log._id} className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:border-emerald-200 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                          <History size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-slate-200 font-bold mb-1">{log.details}</p>
                          <div className="flex items-center gap-3 text-xs font-semibold">
                            <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-md tracking-wider uppercase">{log.action}</span>
                            <span className="text-slate-400 flex items-center gap-1"><User size={12}/> {log.userName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] font-black text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        {new Date(log.timestamp).toLocaleString('he-IL')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <ShieldCheck className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">לא נמצאו רישומים בלוג של מערכת זו.</p>
                  </div>
                )}
              </div>
            </div>          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                 <h2 className="text-xl font-black flex items-center gap-3 dark:text-white">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Download size={20} />
                    </div>
                    מערכת מסמכים (Google Drive)
                 </h2>
              </div>
              <div className="p-8">
                {/* Drag & Drop Zone */}
                <label 
                  onDragOver={(e) => e.preventDefault()} 
                  onDrop={onFileDrop}
                  className="mb-8 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer text-center group bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 text-indigo-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md border border-slate-100 dark:border-slate-700">
                      <Upload size={24} />
                  </div>
                  <h3 className="font-black text-lg text-slate-800 dark:text-white mb-2">גרור מסמכים לכאן</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">או לחץ לחפש מהמחשב (מגובה לענן ב-Google Drive)</p>
                  <input type="file" className="hidden" onChange={onFileDrop} />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {!customer.documents || customer.documents.length === 0 ? (
                      <div className="col-span-full py-16 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
                        אין כרגע מסמכים מצורפים ללקוח זה.
                      </div>
                  ) : (
                      customer.documents.sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).map(doc => (
                        <div key={doc._id} className="p-5 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex justify-between items-center group transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50 bg-white dark:bg-slate-800/50">
                            <div className="flex items-center gap-4 overflow-hidden">
                              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 dark:bg-slate-900/50 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 shadow-inner group-hover:scale-105 transition-transform">
                                  <FileText size={20} />
                              </div>
                              <div className="truncate">
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-indigo-600 transition-colors truncate block max-w-[200px]">
                                    {doc.name}
                                  </a>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <Clock size={10} className="text-slate-400" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                      {new Date(doc.uploadedAt).toLocaleDateString('he-IL')}
                                    </p>
                                  </div>
                              </div>
                            </div>
                            <button 
                              onClick={async () => {
                                  if(!confirm('למחוק מסמך זה?')) return;
                                  const res = await deleteDocument(id, doc._id);
                                 if(res.success) {
                                    toast.success('המסמך נמחק');
                                    loadCustomer();
                                 }
                             }}
                             className="text-slate-300 hover:text-red-500 transition-colors p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                           >
                              <Trash2 size={16} />
                           </button>
                        </div>
                     ))
                  )}
               </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <TaskList customerId={id} initialTasks={customer.tasks} />

          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 p-[1px] rounded-[2rem] shadow-2xl flex flex-col group relative overflow-hidden">
            {/* Inner Glassmorphism Card */}
            <div className="bg-slate-950/80 backdrop-blur-xl rounded-[calc(2rem-1px)] p-7 relative z-10 w-full h-full">
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-black text-xl text-white">תבונה מלאכותית</h3>
              </div>
              
              <p className="text-slate-300/80 text-sm leading-relaxed font-medium mb-6">
                <Clock className="inline mr-1 -mt-0.5" size={14} /> 
                הלקוח נמצא במערכת כבר <strong className="text-white">{Math.floor((new Date() - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24))}</strong> ימים.
              </p>

              <div className="flex justify-between items-center text-sm mb-8 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <span className="text-slate-400 font-medium">סה&quot;כ פעילויות</span>
                <span className="font-black text-white px-3 py-1 bg-white/10 rounded-lg">{customer.notes.length}</span>
              </div>
              
              <div className="space-y-3 mt-auto">
                <button 
                  onClick={async () => {
                    const toastId = toast.loading('מערכת AI מעבדת נתונים...');
                    const { generateAISummary } = await import('@/app/actions/ai');
                    const res = await generateAISummary(id);
                    if (res.success) {
                      toast.success('סיכום מודיעין יוצר בהצלחה!', { id: toastId });
                      loadCustomer();
                    } else {
                      toast.error('שגיאה ביצירת תובנות', { id: toastId });
                    }
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-purple-900/50 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} /> הוסף סיכום מודיעין (AI)
                </button>
                
                <button 
                  disabled={isGeneratingWA}
                  onClick={async () => {
                    setIsGeneratingWA(true);
                    const toastId = toast.loading('ה-AI מנסח הודעת וואטסאפ...');
                    const { generateWhatsAppMessage } = await import('@/app/actions/ai');
                    const res = await generateWhatsAppMessage(id);
                    if (res.success) {
                      setDraftedMessage(res.message);
                      setWaModalOpen(true);
                      toast.success('הודעה מנצחת הוכנה בהצלחה!', { id: toastId });
                    } else {
                      toast.error('שגיאה ביצירת הודעה', { id: toastId });
                    }
                    setIsGeneratingWA(false);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} className="text-emerald-400" /> נסח הודעת WhatsApp
                </button>
              </div>
            </div>
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-pulse"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>
          </div>
        </div>
      </div>

      {waModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                 💬 טיוטת וואטסאפ
              </h3>
              <button onClick={() => setWaModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                ✕
              </button>
            </div>
            <div className="p-8 space-y-4">
               <textarea 
                  value={draftedMessage}
                  onChange={(e) => setDraftedMessage(e.target.value)}
                  className="w-full h-40 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 font-medium whitespace-pre-wrap outline-none focus:ring-2 focus:ring-green-500 transition-shadow resize-none"
               />
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(draftedMessage);
                   toast.success('ההודעה הועתקה ללוח!');
                 }}
                 className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all active:scale-95"
               >
                 העתק ללוח
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
