import React from 'react';
import { Home, MessageCircle, ScanLine, Calendar, Wallet } from 'lucide-react';
import { Tab, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  lang: Language;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, lang }) => {
  const t = TRANSLATIONS[lang];

  const navItems = [
    { id: Tab.HOME, label: t.weather, icon: Home },
    { id: Tab.CHAT, label: t.chatAssistant, icon: MessageCircle },
    { id: Tab.SCAN, label: t.scanPlant, icon: ScanLine },
    { id: Tab.CROPS, label: t.cropCalendar, icon: Calendar },
    { id: Tab.LOANS, label: t.loans, icon: Wallet },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 group ${
                  isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-primary-500 rounded-b-full shadow-glow"></span>
                )}
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-transform duration-200 ${isActive ? '-translate-y-1' : ''}`}
                />
                <span className={`text-[10px] font-medium truncate max-w-full transition-opacity duration-200 ${isActive ? 'opacity-100 font-semibold' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;