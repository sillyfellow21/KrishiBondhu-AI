
import React, { useState, useEffect } from 'react';
import { Tab, Language } from './types';
import { TRANSLATIONS } from './constants';
import BottomNav from './components/BottomNav';
import Home from './features/Home';
import Chat from './features/Chat';
import Scanner from './features/Scanner';
import CropCalendar from './features/CropCalendar';
import LoanTracker from './features/LoanTracker';
import { checkDueReminders } from './services/notificationService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [lang, setLang] = useState<Language>('bn'); // Default to Bengali for target audience
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Check for due reminders when app loads
    checkDueReminders();
    
    // Optional: check every minute if the app stays open
    const interval = setInterval(checkDueReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    setLang(prev => prev === 'bn' ? 'en' : 'bn');
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.HOME:
        return <Home lang={lang} setActiveTab={setActiveTab} />;
      case Tab.CHAT:
        return <Chat lang={lang} />;
      case Tab.SCAN:
        return <Scanner lang={lang} />;
      case Tab.CROPS:
        return <CropCalendar lang={lang} />;
      case Tab.LOANS:
        return <LoanTracker lang={lang} />;
      default:
        return <Home lang={lang} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-slate-100">
      {/* Top Header */}
      <div className="bg-white/80 backdrop-blur-md px-5 py-4 flex justify-between items-center sticky top-0 z-40 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-glow">
            K
          </div>
          <span className="font-bold text-slate-800 tracking-tight text-lg">{t.appTitle}</span>
        </div>
        <button
          onClick={toggleLanguage}
          className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors border border-slate-200"
        >
          {t.switchLang}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="min-h-full">
        {renderContent()}
      </main>

      {/* Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />
    </div>
  );
};

export default App;
