import React, { useEffect, useState } from 'react';
import { Cloud, Wind, Droplets, MapPin, AlertTriangle, ArrowRight, MessageCircle, ScanLine, Wallet, Calendar, Thermometer, Download, LogOut } from 'lucide-react';
import { Language, WeatherData, Coordinates, Tab, User } from '../types';
import { TRANSLATIONS } from '../constants';
import { fetchWeather, getWeatherDescription } from '../services/weatherService';

interface HomeProps {
  lang: Language;
  setActiveTab: (tab: Tab) => void;
  user?: User;
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ lang, setActiveTab, user, onLogout }) => {
  const t = TRANSLATIONS[lang];
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // Listen for installation prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const coords: Coordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            const data = await fetchWeather(coords);
            setWeather(data);
          } catch (e) {
            setError("Could not fetch weather data.");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error(err);
          setError(t.locationError);
          setLoading(false);
          // Fallback coords (Dhaka)
          fetchWeather({ latitude: 23.8103, longitude: 90.4125 })
            .then(setWeather)
            .catch(() => setError("Network Error"))
            .finally(() => setLoading(false));
        }
      );
    } else {
      setError("Geolocation not supported");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const QuickAction = ({ icon: Icon, title, sub, color, onClick }: any) => (
    <button 
      onClick={onClick}
      className="bg-white p-4 rounded-2xl shadow-soft border border-slate-100 flex flex-col items-start text-left active:scale-95 transition-transform duration-200 hover:shadow-md"
    >
      <div className={`p-3 rounded-xl ${color} text-white mb-3 shadow-sm`}>
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </button>
  );

  return (
    <div className="p-5 space-y-6 pb-24 bg-slate-50 min-h-screen">
      {/* Greeting Section */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">
            {new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl font-bold text-slate-800">
            {t.greeting}, {user ? user.name.split(' ')[0] : 'Farmer'} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
            {installPrompt && (
                <button 
                    onClick={handleInstallClick}
                    className="p-2 bg-primary-100 text-primary-600 rounded-full hover:bg-primary-200 transition-colors animate-pulse"
                    title="Install App"
                >
                    <Download size={20} />
                </button>
            )}
            <button 
              onClick={onLogout}
              className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
                <LogOut size={18} />
            </button>
        </div>
      </div>

      {/* Weather Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-emerald-800 rounded-3xl p-6 text-white shadow-glow">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-400/20 rounded-full -ml-5 -mb-5 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
              <MapPin size={12} />
              <span>Dhaka, BD</span>
            </div>
            {weather && (
              <span className="text-xs font-medium bg-primary-500/30 px-2 py-1 rounded text-primary-50">
                {getWeatherDescription(weather.weatherCode, lang)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              {loading ? (
                <div className="animate-pulse h-12 w-24 bg-white/20 rounded"></div>
              ) : (
                <div className="text-5xl font-bold tracking-tighter">
                  {weather?.temperature}°
                </div>
              )}
              <div className="text-primary-100 text-sm mt-1">
                {lang === 'bn' ? 'আজকের তাপমাত্রা' : 'Current Temperature'}
              </div>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <Cloud size={40} className="text-white drop-shadow-md" />
            </div>
          </div>

          {weather && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center space-x-2 bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                <Wind size={16} className="text-primary-200" />
                <span className="text-xs font-semibold">{weather.windSpeed} km/h</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                <Thermometer size={16} className="text-primary-200" />
                <span className="text-xs font-semibold">Hum: 65%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-3">{lang === 'bn' ? 'সেবা সমূহ' : 'Services'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction 
            icon={ScanLine} 
            title={t.identifyDisease} 
            sub={lang === 'bn' ? 'রোগ নির্ণয় করুন' : 'Check crop health'} 
            color="bg-orange-500"
            onClick={() => setActiveTab(Tab.SCAN)}
          />
          <QuickAction 
            icon={MessageCircle} 
            title={t.chatAssistant} 
            sub={lang === 'bn' ? 'প্রশ্ন করুন' : 'Ask questions'} 
            color="bg-blue-500"
            onClick={() => setActiveTab(Tab.CHAT)}
          />
          <QuickAction 
            icon={Calendar} 
            title={t.cropCalendar} 
            sub={lang === 'bn' ? 'মৌসুমী ফসল' : 'Seasonal crops'} 
            color="bg-green-500"
            onClick={() => setActiveTab(Tab.CROPS)}
          />
          <QuickAction 
            icon={Wallet} 
            title={t.loans} 
            sub={lang === 'bn' ? 'ঋণ ব্যবস্থাপনা' : 'Manage debt'} 
            color="bg-purple-500"
            onClick={() => setActiveTab(Tab.LOANS)}
          />
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl shadow-sm flex items-start gap-3">
        <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-900 mb-1">
            {lang === 'bn' ? 'আবহাওয়া সতর্কতা' : 'Weather Alert'}
          </h3>
          <p className="text-xs text-amber-800 leading-relaxed">
            {lang === 'bn' 
              ? 'আগামী ২ দিন ভারী বৃষ্টি হতে পারে। জমির নিষ্কাশন ব্যবস্থা পরীক্ষা করুন।' 
              : 'Heavy rain expected in the next 48 hours. Ensure proper drainage in fields.'}
          </p>
        </div>
      </div>

      {/* Daily Tip */}
      <div className="bg-white p-5 rounded-2xl shadow-soft border border-slate-100">
         <div className="flex items-center gap-3 mb-3">
             <div className="bg-emerald-100 p-2 rounded-full text-emerald-700">
               <Droplets size={20} />
             </div>
             <h3 className="font-bold text-slate-800 text-sm">
               {lang === 'bn' ? 'আজকের পরামর্শ' : 'Tip of the Day'}
             </h3>
         </div>
         <p className="text-sm text-slate-600">
           {lang === 'bn' ? 'বোরো ধানে ইউরিয়া সার প্রয়োগের উপযুক্ত সময় এখনই।' : 'It is the right time to apply Urea fertilizer for Boro rice.'}
         </p>
         <button className="mt-3 text-xs font-bold text-primary-600 flex items-center gap-1">
           {lang === 'bn' ? 'আরও পড়ুন' : 'Read More'} <ArrowRight size={12} />
         </button>
      </div>
    </div>
  );
};

export default Home;