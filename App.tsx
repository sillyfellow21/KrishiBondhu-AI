
import React, { useState, useEffect } from 'react';
import { Tab, Language, User } from './types';
import { TRANSLATIONS } from './constants';
import BottomNav from './components/BottomNav';
import Home from './features/Home';
import Chat from './features/Chat';
import Scanner from './features/Scanner';
import CropCalendar from './features/CropCalendar';
import LoanTracker from './features/LoanTracker';
import Auth from './features/Auth';
import Profile from './features/Profile';
import { checkDueReminders } from './services/notificationService';
import { WifiOff, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [lang, setLang] = useState<Language>('bn');
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const savedSession = localStorage.getItem('kb_session');
    if (savedSession) setUser(JSON.parse(savedSession));
    checkDueReminders();
    const interval = setInterval(checkDueReminders, 60000);
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        clearInterval(interval);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleLanguage = () => setLang(prev => prev === 'bn' ? 'en' : 'bn');
  const handleLogin = (newUser: User) => { setUser(newUser); localStorage.setItem('kb_session', JSON.stringify(newUser)); };
  const handleLogout = () => { setUser(undefined); localStorage.removeItem('kb_session'); setActiveTab(Tab.HOME); };
  const handleUpdateUser = (updated: User) => { setUser(updated); localStorage.setItem('kb_session', JSON.stringify(updated)); };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.HOME: return <Home lang={lang} setActiveTab={setActiveTab} user={user} onLogout={() => setActiveTab(Tab.PROFILE)} />;
      case Tab.CHAT: return <Chat lang={lang} />;
      case Tab.SCAN: return <Scanner lang={lang} />;
      case Tab.CROPS: return <CropCalendar lang={lang} />;
      case Tab.LOANS: return <LoanTracker lang={lang} />;
      case Tab.PROFILE: return <Profile lang={lang} user={user!} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
      default: return <Home lang={lang} setActiveTab={setActiveTab} user={user} onLogout={() => setActiveTab(Tab.PROFILE)} />;
    }
  };

  if (!user) return <Auth lang={lang} onLogin={handleLogin} toggleLang={toggleLanguage} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      {isOffline && (
          <div className="bg-slate-800 text-white text-xs py-2 text-center flex items-center justify-center gap-2 sticky top-0 z-[60]">
              <WifiOff size={14} /> {t.offline}
          </div>
      )}
      <div className="bg-white/80 backdrop-blur-md px-5 py-4 flex justify-between items-center sticky top-0 z-40 border-b border-slate-100 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-glow">K</div>
          <span className="font-bold text-slate-800 tracking-tight text-lg">{t.appTitle}</span>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors border border-slate-200">{t.switchLang}</button>
            <button onClick={() => setActiveTab(Tab.PROFILE)} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"><UserIcon size={18} /></button>
        </div>
      </div>
      <main className="min-h-full max-w-3xl mx-auto w-full">{renderContent()}</main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />
    </div>
  );
};
export default App;
