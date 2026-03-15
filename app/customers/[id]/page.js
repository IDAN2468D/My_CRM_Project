'use client';

import { use, useState, useEffect } from 'react';
import { getCustomerById, updateCustomerStatus, addNote, uploadDocument, deleteDocument } from '../../actions/customer';
import Link from 'next/link';
import TaskList from '@/components/TaskList';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { Download, FileText, Upload, Trash2, Receipt } from 'lucide-react';

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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('הקובץ גדול מדי (מקס׳ 5MB)');
    }
    
    const toastId = toast.loading('מעלה מסמך למערכת...');
    const reader = new FileReader();
    reader.onload = async (event) => {
       const base64Url = event.target.result;
       const res = await uploadDocument(id, file.name, base64Url, file.type);
       if (res.success) {
          toast.success('מסמך נשמר בהצלחה!', { id: toastId });
          loadCustomer();
       } else {
          toast.error('שגיאה בשמירת מסמך', { id: toastId });
       }
    };
    reader.readAsDataURL(file);
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500 pb-20 px-4">
      {/* Header Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
        <Link href="/customers" className="hover:text-blue-600 transition-colors">לקוחות</Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white">{customer.name}</span>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-blue-200 dark:shadow-none">
            👤
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{customer.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 font-bold text-slate-500 dark:text-slate-400">
              <span>📞 {customer.phone}</span>
              {customer.email && <span>📧 {customer.email}</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2 mb-2">
            <button 
              onClick={generateInvoice}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wider hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Receipt size={14} /> הצעת מחיר / PDF
            </button>
          </div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">סטטוס נוכחי</label>
          <select 
            disabled={isUpdating}
            value={customer.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-4 py-3 rounded-2xl font-black text-sm border-2 outline-none transition-all ${
              customer.status === 'New' ? 'text-blue-600 border-blue-100 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-900' :
              customer.status === 'Completed' ? 'text-emerald-600 border-emerald-100 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-900' :
              'text-orange-600 border-orange-100 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-900'
            }`}
          >
            <option value="New">NEW / חדש</option>
            <option value="In Progress">IN PROGRESS / בטיפול</option>
            <option value="Completed">COMPLETED / הושלם</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <button 
              onClick={() => setActiveTab('notes')}
              className={`pb-2 px-4 font-bold text-sm transition-all ${activeTab === 'notes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
            >
              הערות פעילות
            </button>
            <button 
              onClick={() => setActiveTab('audit')}
              className={`pb-2 px-4 font-bold text-sm transition-all ${activeTab === 'audit' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
            >
              לוג שינויים (Audit)
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className={`pb-2 px-4 font-bold text-sm transition-all ${activeTab === 'documents' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
            >
              <div className="flex items-center gap-2">
                מסמכים קשורים 
                <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 px-2 rounded-xl text-xs">{customer.documents?.length || 0}</span>
              </div>
            </button>
          </div>

          {activeTab === 'notes' ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
                <span>📝</span> יומן פעילות והערות
              </h2>
              
              <form onSubmit={handleAddNote} className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3">
                <textarea 
                  placeholder="הוסף הערה חדשה..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium dark:text-white"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <div className="flex justify-end">
                  <button 
                    disabled={isUpdating}
                    className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                  >
                    {isUpdating ? 'שומר...' : 'שלח הערה'}
                  </button>
                </div>
              </form>

              <div className="space-y-6 px-4">
                {customer.notes.length === 0 ? (
                  <p className="text-center text-slate-400 italic py-10">אין הערות ביומן הפעילות</p>
                ) : (
                  customer.notes.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((note, idx) => (
                    <div key={idx} className="relative pr-8 border-r-2 border-slate-100 dark:border-slate-800 pb-2">
                      <div className="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white dark:border-slate-900"></div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{note.text}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-tighter">
                        {new Date(note.createdAt).toLocaleString('he-IL')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : activeTab === 'audit' ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
                <span>🛡️</span> היסטוריית שינויים במערכת
              </h2>
              <div className="space-y-4">
                {customer.auditLogs && customer.auditLogs.length > 0 ? (
                  customer.auditLogs.map((log) => (
                    <div key={log._id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-black text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest">{log.action}</span>
                        <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString('he-IL')}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-sm font-bold">{log.details}</p>
                      <p className="text-[10px] text-slate-500 mt-2 italic">בוצע על ידי: {log.userName}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-10">לא נמצאו רישומים בלוג</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                   <FileText className="text-blue-500" /> מסמכים וקבצים
                 </h2>
                 <label className="cursor-pointer bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors flex items-center gap-2">
                    <Upload size={16} /> העלה מסמך
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                 </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {!customer.documents || customer.documents.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-400 italic font-medium bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                       אין מסמכים מצורפים ללקוח זה.
                    </div>
                 ) : (
                    customer.documents.map(doc => (
                       <div key={doc._id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center group transition-colors hover:border-blue-200 dark:hover:border-blue-900/50 bg-slate-50 dark:bg-slate-900/50">
                          <div className="flex items-center gap-3 overflow-hidden">
                             <div className="w-10 h-10 bg-blue-100 text-blue-600 dark:bg-blue-900/40 rounded-xl flex items-center justify-center shrink-0">
                                <FileText size={18} />
                             </div>
                             <div className="truncate">
                                <a href={doc.url} download={doc.name} className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-blue-600 transition-colors truncate">
                                   {doc.name}
                                </a>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                                   {new Date(doc.uploadedAt).toLocaleDateString('he-IL')}
                                </p>
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
                             className="text-slate-300 hover:text-red-500 transition-colors p-2"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    ))
                 )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <TaskList customerId={id} initialTasks={customer.tasks} />

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-200 dark:shadow-none relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('/api/placeholder/100/100?text=AI')] opacity-5 mix-blend-overlay"></div>
            <h3 className="font-black text-lg mb-2 relative z-10">תובנות מהירות</h3>
            <p className="text-blue-100 text-sm opacity-90 leading-relaxed font-medium relative z-10">
              הלקוח נמצא במערכת כבר {Math.floor((new Date() - new Date(customer.createdAt)) / (1000 * 60 * 60 * 24))} ימים.
            </p>
            <div className="mt-6 pt-6 border-t border-white/10 space-y-4 relative z-10">
              <div className="flex justify-between text-sm">
                <span className="opacity-70">תאריך פתיחה</span>
                <span className="font-bold">{new Date(customer.createdAt).toLocaleDateString('he-IL')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-70">סה"כ הערות</span>
                <span className="font-bold">{customer.notes.length}</span>
              </div>
            </div>
            
            <button 
              onClick={async () => {
                const toastId = toast.loading('בינה מלאכותית מעבדת נתונים...');
                // We dynamically import the action to avoid client/server conflicts in this specific spot
                const { generateAISummary } = await import('@/app/actions/ai');
                const res = await generateAISummary(id);
                if (res.success) {
                  toast.success('סיכום AI יוצר בהצלחה!', { id: toastId });
                  loadCustomer();
                } else {
                  toast.error('שגיאה ביצירת סיכום', { id: toastId });
                }
              }}
              className="mt-6 w-full bg-white/20 hover:bg-white/30 text-white font-black py-3 rounded-xl transition-colors backdrop-blur-sm relative z-10 text-sm shadow-inner flex justify-center items-center gap-2"
            >
              ✨ צור סיכום AI אוטומטי
            </button>
            <button 
              disabled={isGeneratingWA}
              onClick={async () => {
                setIsGeneratingWA(true);
                const toastId = toast.loading('מנסח הודעת וואטסאפ...');
                const { generateWhatsAppMessage } = await import('@/app/actions/ai');
                const res = await generateWhatsAppMessage(id);
                if (res.success) {
                  setDraftedMessage(res.message);
                  setWaModalOpen(true);
                  toast.success('הודעה נוסחה בהצלחה!', { id: toastId });
                } else {
                  toast.error('שגיאה ביצירת הודעה', { id: toastId });
                }
                setIsGeneratingWA(false);
              }}
              className="mt-3 w-full bg-black/20 hover:bg-black/30 text-white font-black py-3 rounded-xl transition-colors backdrop-blur-sm relative z-10 text-sm shadow-inner flex justify-center items-center gap-2 disabled:opacity-50"
            >
              💬 נסח הודעת וואטסאפ
            </button>
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
