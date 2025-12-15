
import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, CheckCircle, Circle, Calendar as CalendarIcon, ArrowUpRight, X, FileText, Info, History, Bell, Pencil, Zap, Landmark, CreditCard, AlertTriangle, ChevronLeft } from 'lucide-react';
import { Language, Loan, Reminder } from '../types';
import { TRANSLATIONS } from '../constants';
import { requestNotificationPermission, sendNotification, saveReminder } from '../services/notificationService';

interface LoanTrackerProps {
  lang: Language;
}

type PaymentStep = 'select' | 'input' | 'processing' | 'success' | 'failure';

const LoanTracker: React.FC<LoanTrackerProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
  
  // Payment States
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'bank' | null>(null);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('select');
  const [pin, setPin] = useState('');
  const [bankDetails, setBankDetails] = useState({ bankName: '', accountNo: '', transactionId: '' });
  
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
        setLoans(prev => prev.map(loan => {
            if (loan.id === editingId) {
                return { ...loan, lenderName: formData.lenderName, amount: parseFloat(formData.amount), dueDate: formData.dueDate, notes: formData.notes };
            }
            return loan;
        }));
        setEditingId(null);
    } else {
        const newLoan: Loan = { id: Date.now().toString(), lenderName: formData.lenderName, amount: parseFloat(formData.amount), startDate: new Date().toISOString().split('T')[0], dueDate: formData.dueDate || '', status: 'active', notes: formData.notes };
        setLoans(prev => [newLoan, ...prev]);
        setViewMode('active'); 
    }
    setIsAdding(false);
    setFormData({ lenderName: '', amount: '', dueDate: '', notes: '' });
  };

  const startEditing = (loan: Loan) => {
      setEditingId(loan.id);
      setFormData({ lenderName: loan.lenderName, amount: loan.amount.toString(), dueDate: loan.dueDate, notes: loan.notes || '' });
      setSelectedLoan(null); 
      setIsAdding(true);
  };

  const deleteLoan = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure?')) {
      setLoans(prev => prev.filter(loan => loan.id !== id));
      if (selectedLoan?.id === id) setSelectedLoan(null);
    }
  };

  const handleSetReminder = async () => {
    if (!selectedLoan || !selectedLoan.dueDate) return;
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
      const reminder: Reminder = { id: Date.now().toString(), title: t.loanDue, body: `${t.lenderName}: ${selectedLoan.lenderName}, ${t.amount}: ${selectedLoan.amount}`, date: selectedLoan.dueDate, type: 'loan', relatedId: selectedLoan.id, isCompleted: false };
      saveReminder(reminder);
      sendNotification("Reminder Set", `${t.loanDue} on ${selectedLoan.dueDate}`);
      alert(t.reminderSet);
    } else { alert(t.permissionDenied); }
  };

  // --- Payment Logic ---
  const openPaymentModal = () => {
    setPaymentModalOpen(true);
    setPaymentStep('select');
    setPaymentMethod(null);
    setPin('');
    setBankDetails({ bankName: '', accountNo: '', transactionId: '' });
  };

  const handlePaymentSubmit = () => {
      setPaymentStep('processing');
      setTimeout(() => {
          // Mock Failure Logic: If amount > 50000 or PIN is '0000'
          if (pin === '0000') {
              setPaymentStep('failure');
          } else {
              setPaymentStep('success');
              if (selectedLoan) {
                setLoans(prev => prev.map(l => l.id === selectedLoan.id ? { ...l, status: 'paid' } : l));
              }
          }
      }, 2000);
  };

  const handleClosePayment = () => {
      setPaymentModalOpen(false);
      // If successful, close details modal too
      if (paymentStep === 'success') {
          setSelectedLoan(null);
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
        <p className="text-slate-300 text-sm font-medium mb-1">{viewMode === 'active' ? t.totalDebt : t.totalPaid}</p>
        <div className="text-4xl font-bold tracking-tight mb-2">৳ {(viewMode === 'active' ? totalDebt : totalPaid).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</div>
        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
           <div className={`w-2 h-2 rounded-full ${viewMode === 'active' ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`}></div>
           <p className="text-slate-200 text-xs font-medium">{viewMode === 'active' ? activeLoans.length : paidLoans.length} {viewMode === 'active' ? t.activeLoans : t.paid}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex bg-slate-200/60 p-1.5 rounded-xl">
            <button onClick={() => setViewMode('active')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'active' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>{t.activeLoans}</button>
            <button onClick={() => setViewMode('history')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'history' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>{t.history}</button>
        </div>
        <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-slate-800 text-lg">{t.loanTracker}</h3>
            {!isAdding && viewMode === 'active' && (
            <button onClick={() => { setIsAdding(true); setEditingId(null); }} className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-xl shadow-md transition-colors active:scale-95"><Plus size={20} /></button>
            )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 mb-6">
          <h3 className="font-bold text-slate-800 mb-4 text-lg">{editingId ? t.editLoan : t.addLoan}</h3>
          <div className="space-y-4">
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">{t.lenderName}</label><input type="text" value={formData.lenderName} onChange={e => setFormData({...formData, lenderName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-slate-500 mb-1">{t.amount}</label><input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 mb-1">{t.dueDate}</label><input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" /></div>
            </div>
             <div><label className="block text-xs font-semibold text-slate-500 mb-1">{t.notes}</label><textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-20 resize-none" /></div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold">{t.cancel}</button>
              <button onClick={handleSaveLoan} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold">{t.saveLoan}</button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredLoans.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <FileText size={40} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium mb-4">{t.noLoans}</p>
              {viewMode === 'active' && (
                  <button onClick={() => setIsAdding(true)} className="px-6 py-2 bg-primary-100 text-primary-700 rounded-full font-bold text-sm">
                      {t.addLoan}
                  </button>
              )}
          </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {filteredLoans.map((loan) => (
          <div key={loan.id} onClick={() => setSelectedLoan(loan)} className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden transition-all cursor-pointer ${loan.status === 'paid' ? 'opacity-90' : ''}`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${loan.status === 'active' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            <div className="flex justify-between items-start mb-3 pl-3">
              <div>
                <div className={`text-xs font-medium mb-0.5 uppercase tracking-wide ${loan.status === 'active' ? 'text-slate-500' : 'text-emerald-600'}`}>{loan.status === 'active' ? t.active : t.paid}</div>
                <h3 className="font-bold text-slate-800 text-lg">{loan.lenderName}</h3>
              </div>
              <div className="text-right"><div className={`text-xl font-bold ${loan.status === 'active' ? 'text-slate-900' : 'text-emerald-600'}`}>৳ {loan.amount.toLocaleString()}</div></div>
            </div>
            <div className="flex items-center justify-between pl-3 mt-4 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-1.5 text-slate-500 text-sm"><CalendarIcon size={14} /><span className={loan.status === 'active' && loan.dueDate && new Date(loan.dueDate) < new Date() ? 'text-red-500 font-bold' : ''}>{loan.dueDate || 'No Date'}</span></div>
              <div className="flex gap-2">
                <button onClick={(e) => deleteLoan(loan.id, e)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedLoan && !paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedLoan(null)}></div>
           <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative z-10 p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div><h2 className="text-xl font-bold text-slate-800">{t.loanDetails}</h2></div>
                <div className="flex items-center gap-2">
                    {selectedLoan.status === 'active' && (
                        <button onClick={() => startEditing(selectedLoan)} className="p-2 bg-slate-100 rounded-full hover:bg-blue-50 hover:text-blue-600 text-slate-600"><Pencil size={20} /></button>
                    )}
                    <button onClick={() => setSelectedLoan(null)} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
                </div>
              </div>
              <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 relative mb-6">
                  {selectedLoan.status === 'active' && selectedLoan.dueDate && (
                        <button onClick={handleSetReminder} className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-primary-600"><Bell size={18} /></button>
                  )}
                  <p className="text-sm text-slate-500 mb-1">{t.amount}</p>
                  <div className="text-4xl font-bold text-slate-900">৳ {selectedLoan.amount.toLocaleString()}</div>
                  <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${selectedLoan.status === 'active' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{selectedLoan.status === 'active' ? t.active : t.paid}</div>
              </div>
              <div className="space-y-4 mb-6">
                    <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-500 text-sm font-medium">{t.lenderName}</span><span className="text-slate-800 font-semibold">{selectedLoan.lenderName}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-500 text-sm font-medium">{t.dueDate}</span><span className="text-slate-800 font-semibold">{selectedLoan.dueDate || 'N/A'}</span></div>
              </div>
              {selectedLoan.notes && (<div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-6"><div className="flex items-center gap-2 text-yellow-700 font-bold text-sm mb-2"><FileText size={16} /> {t.notes}</div><p className="text-slate-700 text-sm italic whitespace-pre-wrap">{selectedLoan.notes}</p></div>)}
              {selectedLoan.status === 'active' && (
                  <button onClick={openPaymentModal} className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-md flex items-center justify-center gap-2">
                      <CreditCard size={18} /> {t.selectPaymentMethod}
                  </button>
              )}
           </div>
        </div>
      )}

      {/* Full Screen Payment Modal */}
      {paymentModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col">
            {/* Header */}
            <div className={`p-4 flex items-center justify-between shadow-sm ${paymentStep === 'success' ? 'bg-emerald-600 text-white' : (paymentStep === 'failure' ? 'bg-[#e2136e] text-white' : 'bg-white text-slate-800')}`}>
                <button onClick={handleClosePayment} className="p-2 rounded-full hover:bg-black/10"><X size={24} /></button>
                <h2 className="font-bold text-lg">{t.loanTracker}</h2>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                
                {/* Step 1: Selection */}
                {paymentStep === 'select' && (
                    <div className="w-full max-w-sm space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-xl font-bold text-center mb-6">{t.selectPaymentMethod}</h2>
                        <div className="text-center mb-8">
                             <p className="text-slate-500 mb-1">{t.amount}</p>
                             <p className="text-4xl font-bold text-slate-900">৳ {selectedLoan.amount.toLocaleString()}</p>
                        </div>
                        <button onClick={() => { setPaymentMethod('bkash'); setPaymentStep('input'); }} className="w-full p-5 bg-[#e2136e] text-white rounded-2xl shadow-md hover:opacity-90 flex items-center justify-between">
                            <div className="flex items-center gap-3"><Zap size={24} className="fill-white"/> <span className="font-bold text-lg">bKash</span></div>
                            <ArrowUpRight />
                        </button>
                        <button onClick={() => { setPaymentMethod('bank'); setPaymentStep('input'); }} className="w-full p-5 bg-blue-600 text-white rounded-2xl shadow-md hover:opacity-90 flex items-center justify-between">
                            <div className="flex items-center gap-3"><Landmark size={24} /> <span className="font-bold text-lg">Bank Transfer</span></div>
                            <ArrowUpRight />
                        </button>
                    </div>
                )}

                {/* Step 2: Input */}
                {paymentStep === 'input' && (
                    <div className="w-full max-w-sm space-y-6 animate-in fade-in slide-in-from-right-4">
                         <button onClick={() => setPaymentStep('select')} className="flex items-center text-slate-500 font-bold mb-4"><ChevronLeft size={20}/> {t.goBack}</button>
                         <div className={`p-6 rounded-2xl text-white shadow-lg ${paymentMethod === 'bkash' ? 'bg-[#e2136e]' : 'bg-blue-600'}`}>
                             <p className="opacity-80 text-sm font-medium mb-1">{t.merchant}</p>
                             <p className="font-bold text-lg mb-4">KrishiBondhu</p>
                             <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md">
                                 <p className="text-sm opacity-80 mb-1">{t.amount}</p>
                                 <p className="text-3xl font-bold">৳ {selectedLoan.amount.toLocaleString()}</p>
                             </div>
                         </div>

                         {paymentMethod === 'bkash' ? (
                             <div className="space-y-4">
                                 <label className="block font-bold text-slate-500">{t.enterPin}</label>
                                 <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={5} className="w-full text-center text-3xl tracking-[0.5em] p-4 border-b-2 border-slate-300 focus:border-[#e2136e] outline-none font-bold" placeholder="•••••" />
                             </div>
                         ) : (
                             <div className="space-y-4">
                                 <input type="text" placeholder={t.bankName} className="w-full p-4 bg-slate-100 rounded-xl outline-none" onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})} />
                                 <input type="text" placeholder={t.accountNumber} className="w-full p-4 bg-slate-100 rounded-xl outline-none" onChange={(e) => setBankDetails({...bankDetails, accountNo: e.target.value})} />
                                 <input type="text" placeholder={t.transactionId} className="w-full p-4 bg-slate-100 rounded-xl outline-none" onChange={(e) => setBankDetails({...bankDetails, transactionId: e.target.value})} />
                             </div>
                         )}

                         <button onClick={handlePaymentSubmit} className={`w-full py-4 rounded-xl text-white font-bold shadow-lg ${paymentMethod === 'bkash' ? 'bg-[#e2136e]' : 'bg-blue-600'}`}>
                             {t.confirm}
                         </button>
                    </div>
                )}

                {/* Step 3: Processing */}
                {paymentStep === 'processing' && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4 ${paymentMethod === 'bkash' ? 'border-[#e2136e]' : 'border-blue-600'}`}></div>
                        <p className="text-xl font-bold text-slate-500">{t.processing}</p>
                    </div>
                )}

                {/* Step 4: Success */}
                {paymentStep === 'success' && (
                    <div className="text-center w-full max-w-sm animate-in zoom-in-95">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={48} className="text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">{t.paymentSuccess}</h2>
                        <p className="text-slate-500 mb-8">{t.amount}: ৳ {selectedLoan.amount.toLocaleString()}</p>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 text-left">
                            <div className="flex justify-between mb-2"><span className="text-slate-500">{t.transactionId}</span><span className="font-mono font-bold">KB-{Date.now().toString().slice(-6)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">{t.lenderName}</span><span className="font-bold">{selectedLoan.lenderName}</span></div>
                        </div>
                        <button onClick={handleClosePayment} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700">
                            {t.goBack}
                        </button>
                    </div>
                )}

                {/* Step 5: Failure */}
                {paymentStep === 'failure' && (
                    <div className="text-center w-full max-w-sm animate-in zoom-in-95">
                         <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <X size={48} className="text-red-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">{t.paymentFailed}</h2>
                        <p className="text-slate-500 mb-8">{t.insufficientFunds}</p>
                        <button onClick={() => setPaymentStep('input')} className={`w-full py-4 rounded-xl text-white font-bold shadow-lg mb-3 ${paymentMethod === 'bkash' ? 'bg-[#e2136e]' : 'bg-blue-600'}`}>
                            {t.retryPayment}
                        </button>
                        <button onClick={handleClosePayment} className="w-full py-4 bg-slate-200 text-slate-700 rounded-xl font-bold">
                            {t.cancel}
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default LoanTracker;
