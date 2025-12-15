
import React, { useState } from 'react';
import { User, MapPin, Globe, LogOut, ChevronRight, Save, X } from 'lucide-react';
import { Language, User as UserType } from '../types';
import { TRANSLATIONS } from '../constants';

interface ProfileProps {
  lang: Language;
  user: UserType;
  onLogout: () => void;
  onUpdateUser: (updatedUser: UserType) => void;
}

const Profile: React.FC<ProfileProps> = ({ lang, user, onLogout, onUpdateUser }) => {
  const t = TRANSLATIONS[lang];
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    location: user.location || 'Bangladesh',
    phone: user.phone
  });

  const handleSave = () => {
    const updated = { ...user, ...formData };
    onUpdateUser(updated);
    setIsEditing(false);
  };

  return (
    <div className="p-5 pb-24 min-h-screen bg-slate-50">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">{t.profile}</h2>
      
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 mb-6 flex flex-col items-center">
         <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
             {user.name.charAt(0)}
         </div>
         <h3 className="text-xl font-bold text-slate-800">{user.name}</h3>
         <p className="text-slate-500 text-sm">{user.phone}</p>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-soft border border-slate-100">
          {!isEditing ? (
              <div className="divide-y divide-slate-100">
                  <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer" onClick={() => setIsEditing(true)}>
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><User size={20}/></div>
                          <div><p className="text-sm text-slate-500">{t.fullName}</p><p className="font-semibold text-slate-800">{user.name}</p></div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer" onClick={() => setIsEditing(true)}>
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><MapPin size={20}/></div>
                          <div><p className="text-sm text-slate-500">{t.location}</p><p className="font-semibold text-slate-800">{user.location || 'Not set'}</p></div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                  </div>
              </div>
          ) : (
              <div className="p-6 space-y-4 animate-in fade-in">
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 mb-1 block">{t.fullName}</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 mb-1 block">{t.location}</label>
                      <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div className="flex gap-3 pt-2">
                      <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">{t.cancel}</button>
                      <button onClick={handleSave} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-md">{t.saveChanges}</button>
                  </div>
              </div>
          )}
      </div>

      <button onClick={onLogout} className="w-full mt-6 py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
          <LogOut size={20} /> {t.logout}
      </button>
    </div>
  );
};
export default Profile;
