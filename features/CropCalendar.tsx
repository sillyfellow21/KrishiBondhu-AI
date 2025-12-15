
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Sprout, X, Bell, Droplets, Search, Thermometer, AlertTriangle, Activity } from 'lucide-react';
import { Language, CropInfo, Reminder } from '../types';
import { TRANSLATIONS, CROPS } from '../constants';
import { requestNotificationPermission, sendNotification, saveReminder } from '../services/notificationService';

interface CropCalendarProps {
  lang: Language;
}

const CropCalendar: React.FC<CropCalendarProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [selectedCrop, setSelectedCrop] = useState<CropInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderData, setReminderData] = useState({ date: '', type: '' });

  const filteredCrops = CROPS.filter(c => 
     c.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.nameBn.includes(searchTerm)
  );

  const handleSetReminder = async () => {
    if (!selectedCrop || !reminderData.date || !reminderData.type) return;
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
      const reminder: Reminder = { id: Date.now().toString(), title: `${t.fertilizerFor} ${lang === 'bn' ? selectedCrop.nameBn : selectedCrop.nameEn}`, body: `${t.reminderType}: ${reminderData.type}`, date: reminderData.date, type: 'fertilizer', relatedId: selectedCrop.id, isCompleted: false };
      saveReminder(reminder);
      sendNotification(t.reminderSet, `${t.fertilizerFor} ${selectedCrop.nameEn} on ${reminderData.date}`);
      alert(t.reminderSet);
      setShowReminderForm(false);
      setReminderData({ date: '', type: '' });
    } else { alert(t.permissionDenied); }
  };

  return (
    <div className="p-5 pb-24 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">{t.cropCalendar}</h2>
        <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder={t.searchCrops} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-400 outline-none shadow-sm"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {filteredCrops.map((crop) => (
          <div key={crop.id} onClick={() => setSelectedCrop(crop)} className="bg-white rounded-2xl overflow-hidden shadow-soft border border-slate-100 flex group hover:shadow-md transition-all active:scale-[0.98] cursor-pointer">
            <div className="w-32 h-auto relative overflow-hidden">
              <img src={crop.image} alt={crop.nameEn} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center">
              <h3 className="font-bold text-lg text-slate-800 mb-1">{lang === 'bn' ? crop.nameBn : crop.nameEn}</h3>
              <div className="flex items-center text-xs text-slate-500 mb-3 font-medium"><Sprout size={12} className="mr-1.5 text-primary-500" /><span className="uppercase tracking-wide">{crop.season}</span></div>
              <div className="space-y-1.5">
                <div className="flex items-center text-xs text-slate-600 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100"><Clock size={12} className="mr-2 text-emerald-600" /><span className="font-semibold">{crop.plantingTime}</span></div>
                <div className="flex items-center text-xs text-slate-600 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100"><CalendarIcon size={12} className="mr-2 text-orange-500" /><span className="font-semibold">{crop.harvestTime}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedCrop(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="relative h-56">
                <img src={selectedCrop.image} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <button onClick={() => setSelectedCrop(null)} className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white"><X size={20} /></button>
                <div className="absolute bottom-6 left-6 text-white">
                    <h2 className="text-3xl font-bold mb-1">{lang === 'bn' ? selectedCrop.nameBn : selectedCrop.nameEn}</h2>
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">{selectedCrop.season} Season</span>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Expanded Details */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Thermometer size={18} className="text-orange-500 mb-2"/>
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">{t.idealConditions}</p>
                        <p className="text-sm font-semibold text-slate-800">{selectedCrop.idealTemp}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Activity size={18} className="text-emerald-500 mb-2"/>
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">{t.growthDuration}</p>
                        <p className="text-sm font-semibold text-slate-800">{selectedCrop.growthDuration}</p>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><AlertTriangle size={18} className="text-red-500"/> {t.commonIssues}</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedCrop.commonDiseases?.map(d => (
                            <span key={d} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100">{d}</span>
                        ))}
                    </div>
                </div>

                {/* Reminder Section */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                   <div className="flex items-center gap-2 mb-4">
                       <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm"><Droplets size={18} /></div>
                       <h3 className="font-bold text-slate-800">{t.addFertilizerReminder}</h3>
                   </div>
                   {!showReminderForm ? (
                       <button onClick={() => setShowReminderForm(true)} className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"><Bell size={18} />{t.setReminder}</button>
                   ) : (
                       <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                           <div><label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">{t.reminderDate}</label><input type="date" value={reminderData.date} onChange={(e) => setReminderData({...reminderData, date: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" /></div>
                           <div><label className="text-xs font-semibold text-slate-500 ml-1 mb-1 block">{t.reminderType}</label><input type="text" placeholder="e.g. Urea" value={reminderData.type} onChange={(e) => setReminderData({...reminderData, type: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" /></div>
                           <div className="flex gap-2 pt-2"><button onClick={() => setShowReminderForm(false)} className="flex-1 py-2 text-sm font-bold text-slate-500 bg-slate-100 rounded-lg">{t.cancel}</button><button onClick={handleSetReminder} className="flex-1 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg shadow-md">{t.save}</button></div>
                       </div>
                   )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropCalendar;
