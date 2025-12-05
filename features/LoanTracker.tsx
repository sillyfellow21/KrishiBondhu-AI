
import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, CheckCircle, Circle, Calendar as CalendarIcon, ArrowUpRight, X, FileText, Info, History, Bell, BellRing, Pencil } from 'lucide-react';
import { Language, Loan, Reminder } from '../types';
import { TRANSLATIONS } from '../constants';
import { requestNotificationPermission, sendNotification, saveReminder } from '../services/notificationService';

interface LoanTrackerProps {
  lang: Language;
}

const LoanTracker: React.FC<LoanTrackerProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
  const [formData, setFormData] = useState({
    lenderName: '',
    amount: '',
    dueDate: '',
    notes: '',
  });

  useEffect(() => {
    const savedLoans = localStorage.getItem('kb_loans');
    if (savedLoans) {
      setLoans(JSON.parse(savedLoans));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kb_loans', JSON.stringify(loans));
  }, [loans]);

  const handleSaveLoan = () => {
    if (!formData.lenderName || !formData.amount) return;

    if (editingId) {
        // Update existing loan
        setLoans(prev => prev.map(loan => {
            if (loan.id === editingId) {
                return {
                    ...loan,
                    lenderName: formData.lenderName,
                    amount: parseFloat(formData.amount),
                    dueDate: formData.dueDate,
                    notes: formData.notes
                };
            }
            return loan;
        }));
        setEditingId(null);
        // If the edited loan was selected (though modal is closed during edit), update it if needed or just clear it
    } else {
        // Create new loan
        const newLoan: Loan = {
            id: Date.now().toString(),
            lenderName: formData.lenderName,
            amount: parseFloat(formData.amount),
            startDate: new Date().toISOString().split('T')[0],
            dueDate: formData.dueDate || '',
            status: 'active',
            notes: formData.notes,
        };
        setLoans(prev => [newLoan, ...prev]);
        setViewMode('active'); 
    }

    setIsAdding(false);
    setFormData({ lenderName: '', amount: '', dueDate: '', notes: '' });
  };

  const startEditing = (loan: Loan) => {
      setEditingId(loan.id);
      setFormData({
          lenderName: loan.lenderName,
          amount: loan.amount.toString(),
          dueDate: loan.dueDate,
          notes: loan.notes || ''
      });
      setSelectedLoan(null); // Close modal
      setIsAdding(true); // Open form
  };

  const handleCancel = () => {
      setIsAdding(false);
      setEditingId(null);
      setFormData({ lenderName: '', amount: '', dueDate: '', notes: '' });
  };

  const toggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoans(prev => prev.map(loan => 
      loan.id === id 
        ? { ...loan, status: loan.status === 'active' ? 'paid' : 'active' } 
        : loan
    ));
    if (selectedLoan && selectedLoan.id === id) {
        setSelectedLoan(prev => prev ? { ...prev, status: prev.status === 'active' ? 'paid' : 'active' } : null);
    }
  };

  const deleteLoan = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      setLoans(prev => prev.filter(loan => loan.id !== id));
      if (selectedLoan?.id === id) setSelectedLoan(null);
    }
  };

  const handleSetReminder = async () => {
    if (!selectedLoan || !selectedLoan.dueDate) return;
    
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
      const reminder: Reminder = {
        id: Date.now().toString(),
        title: t.loanDue,
        body: `${t.lenderName}: ${selectedLoan.lenderName}, ${t.amount}: ${selectedLoan.amount}`,
        date: selectedLoan.dueDate,
        type: 'loan',
        relatedId: selectedLoan.id,
        isCompleted: false
      };
      
      saveReminder(reminder);
      sendNotification("Reminder Set", `${t.loanDue} on ${selectedLoan.dueDate}`);
      alert(t.reminderSet);
    } else {
      alert(t.permissionDenied);
    }
  };

  const activeLoans = loans.filter(l => l.status === 'active');
  const paidLoans = loans.filter(l => l.status === 'paid');
  
  const filteredLoans = viewMode === 'active' ? activeLoans : paidLoans;
  
  const totalDebt = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalPaid = paidLoans.reduce((sum, loan) => sum + loan.amount, 0);

  return (
    <div className="p-5 pb-24 min-h-screen bg-slate-50 relative">
      
      {/* Summary Card */}
      <div className={`bg-gradient-to-r ${viewMode === 'active' ? 'from-slate-900 to-slate-800' : 'from-emerald-900 to-emerald-800'} rounded-3xl p-6 text-white shadow-xl mb-6 relative overflow-hidden transition-colors duration-500`}>
        <div className="absolute top-0 right-0 p-6 opacity-10">
           {viewMode === 'active' ? <Wallet size={100} /> : <CheckCircle size={100} />}
        </div>
        <p className="text-slate-300 text-sm font-medium mb-1">
            {viewMode === 'active' ? t.totalDebt : t.totalPaid}
        </p>
        <div className="text-4xl font-bold tracking-tight mb-2">
          ৳ {(viewMode === 'active' ? totalDebt : totalPaid).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}
        </div>
        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
           <div className={`w-2 h-2 rounded-full ${viewMode === 'active' ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`}></div>
           <p className="text-slate-200 text-xs font-medium">
             {viewMode === 'active' ? activeLoans.length : paidLoans.length} {viewMode === 'active' ? (lang === 'bn' ? 'টি সক্রিয় ঋণ' : 'Active Loans') : (lang === 'bn' ? 'টি পরিশোধিত ঋণ' : 'Paid Loans')}
           </p>
        </div>
      </div>

      {/* Toggle & Header */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex bg-slate-200/60 p-1.5 rounded-xl">
            <button 
                onClick={() => setViewMode('active')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${viewMode === 'active' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Wallet size={16} />
                {t.activeLoans}
            </button>
            <button 
                onClick={() => setViewMode('history')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${viewMode === 'history' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <History size={16} />
                {t.history}
            </button>
        </div>

        <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-slate-800 text-lg">
                {viewMode === 'active' ? (lang === 'bn' ? 'বর্তমান তালিকা' : 'Current List') : (lang === 'bn' ? 'পরিশোধের ইতিহাস' : 'Payment History')}
            </h3>
            {!isAdding && viewMode === 'active' && (
            <button 
                onClick={() => { setIsAdding(true); setEditingId(null); }}
                className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-xl shadow-md transition-colors active:scale-95"
            >
                <Plus size={20} />
            </button>
            )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 mb-6 animate-in slide-in-from-top-4">
          <h3 className="font-bold text-slate-800 mb-4 text-lg">{editingId ? t.editLoan : t.addLoan}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">{t.lenderName}</label>
              <input
                type="text"
                value={formData.lenderName}
                onChange={e => setFormData({...formData, lenderName: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                placeholder="e.g. Grameen Bank"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">{t.amount}</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">{t.dueDate}</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>
            </div>

             <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">{t.notes}</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all h-20 resize-none"
                placeholder="..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveLoan}
                className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 shadow-md transition-colors"
              >
                {t.saveLoan}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loan List */}
      <div className="space-y-4">
        {filteredLoans.length === 0 && !isAdding && (
          <div className="text-center py-16 text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
               {viewMode === 'active' ? <Wallet size={32} className="opacity-50" /> : <CheckCircle size={32} className="opacity-50" />}
            </div>
            <p>{t.noLoans}</p>
          </div>
        )}
        
        {filteredLoans.map((loan) => (
          <div 
            key={loan.id} 
            onClick={() => setSelectedLoan(loan)}
            className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden transition-all cursor-pointer active:scale-[0.98] ${loan.status === 'paid' ? 'opacity-90' : ''}`}
          >
            {/* Status Stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${loan.status === 'active' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>

            <div className="flex justify-between items-start mb-3 pl-3">
              <div>
                <div className={`text-xs font-medium mb-0.5 uppercase tracking-wide ${loan.status === 'active' ? 'text-slate-500' : 'text-emerald-600'}`}>
                  {loan.status === 'active' ? (lang === 'bn' ? 'চলমান ঋণ' : 'Active Loan') : (lang === 'bn' ? 'পরিশোধিত' : 'Paid Off')}
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{loan.lenderName}</h3>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${loan.status === 'active' ? 'text-slate-900' : 'text-emerald-600'}`}>
                  ৳ {loan.amount.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pl-3 mt-4 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                 <CalendarIcon size={14} />
                 <span className={loan.status === 'active' && loan.dueDate && new Date(loan.dueDate) < new Date() ? 'text-red-500 font-bold' : ''}>
                    {loan.dueDate || 'No Date'}
                  </span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={(e) => deleteLoan(loan.id, e)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={(e) => toggleStatus(loan.id, e)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                    loan.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {loan.status === 'active' ? (
                    <>
                      <CheckCircle size={16} /> {t.markPaid}
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={16} /> {t.markActive}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedLoan(null)}></div>
           <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative z-10 p-6 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h2 className="text-xl font-bold text-slate-800">{t.loanDetails}</h2>
                   <div className="flex items-center gap-1.5 mt-1">
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-mono px-2 py-1 rounded-md font-bold tracking-widest">
                        #{selectedLoan.id.slice(-4)}
                      </span>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                    {selectedLoan.status === 'active' && (
                        <button 
                            onClick={() => startEditing(selectedLoan)} 
                            className="p-2 bg-slate-100 rounded-full hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors"
                            title={t.editLoan}
                        >
                            <Pencil size={20} />
                        </button>
                    )}
                    <button onClick={() => setSelectedLoan(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 relative">
                    {selectedLoan.status === 'active' && selectedLoan.dueDate && (
                        <button 
                            onClick={handleSetReminder}
                            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-primary-600 transition-colors"
                            title={t.setReminder}
                        >
                            <Bell size={18} />
                        </button>
                    )}
                    <p className="text-sm text-slate-500 mb-1">{t.amount}</p>
                    <div className="text-4xl font-bold text-slate-900">
                      ৳ {selectedLoan.amount.toLocaleString()}
                    </div>
                    <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${selectedLoan.status === 'active' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                       {selectedLoan.status === 'active' ? t.active : t.paid}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between border-b border-slate-100 pb-3">
                       <span className="text-slate-500 text-sm font-medium">{t.lenderName}</span>
                       <span className="text-slate-800 font-semibold">{selectedLoan.lenderName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-3">
                       <span className="text-slate-500 text-sm font-medium">{t.startDate}</span>
                       <span className="text-slate-800 font-semibold">{selectedLoan.startDate}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-3">
                       <span className="text-slate-500 text-sm font-medium">{t.dueDate}</span>
                       <div className="flex items-center gap-2">
                           <span className="text-slate-800 font-semibold">{selectedLoan.dueDate || 'N/A'}</span>
                       </div>
                    </div>
                 </div>
                 
                 {selectedLoan.notes && (
                   <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                      <div className="flex items-center gap-2 text-yellow-700 font-bold text-sm mb-2">
                         <FileText size={16} /> {t.notes}
                      </div>
                      <p className="text-slate-700 text-sm italic whitespace-pre-wrap">
                        {selectedLoan.notes}
                      </p>
                   </div>
                 )}
              </div>

              <div className="mt-8">
                 <button 
                   onClick={() => setSelectedLoan(null)}
                   className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                 >
                   {t.close}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default LoanTracker;
