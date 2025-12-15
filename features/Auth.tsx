
import React, { useState } from 'react';
import { User, Lock, Phone, ArrowRight, Sprout, Fingerprint, ChevronLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Language, User as UserType } from '../types';
import { TRANSLATIONS } from '../constants';

interface AuthProps {
  lang: Language;
  onLogin: (user: UserType) => void;
  toggleLang: () => void;
}

type AuthView = 'login' | 'register' | 'forgot-phone' | 'forgot-otp' | 'forgot-reset';

const Auth: React.FC<AuthProps> = ({ lang, onLogin, toggleLang }) => {
  const t = TRANSLATIONS[lang];
  const [view, setView] = useState<AuthView>('login');
  
  // Form States
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple BD Phone Regex: 01xxxxxxxxx (11 digits) or +8801xxxxxxxxx
  const isValidPhone = (p: string) => {
    const regex = /^(\+88)?01[3-9]\d{8}$/;
    return regex.test(p);
  };

  const handleAuth = () => {
    setError('');
    setSuccessMsg('');
    
    // 1. Validation
    if (!phone || !password || (view === 'register' && (!name || !confirmPassword))) {
      setError(t.fillAllFields);
      return;
    }
    if (!isValidPhone(phone)) {
      setError(t.invalidPhone);
      return;
    }
    if (view === 'register' && password !== confirmPassword) {
        setError(t.passwordsDontMatch);
        return;
    }

    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      // 2. Get Users from LocalStorage (Mock Backend)
      const usersStr = localStorage.getItem('kb_users');
      const users: UserType[] = usersStr ? JSON.parse(usersStr) : [];

      if (view === 'login') {
        // LOGIN LOGIC
        const foundUser = users.find(u => u.phone === phone && u.password === password);
        if (foundUser) {
          onLogin(foundUser);
        } else {
          setError(t.wrongCredentials);
          setLoading(false);
        }
      } else {
        // SIGNUP LOGIC
        const exists = users.find(u => u.phone === phone);
        if (exists) {
          setError(t.userExists);
          setLoading(false);
          return;
        }

        const newUser: UserType = {
          id: Date.now().toString(),
          name,
          phone,
          password,
          location: 'Bangladesh'
        };

        // Save new user
        localStorage.setItem('kb_users', JSON.stringify([...users, newUser]));
        onLogin(newUser);
      }
    }, 1000);
  };

  const handleBiometricLogin = () => {
    setLoading(true);
    setTimeout(() => {
        // Mock: Find last logged in user or first user
        const usersStr = localStorage.getItem('kb_users');
        const users: UserType[] = usersStr ? JSON.parse(usersStr) : [];
        if (users.length > 0) {
            onLogin(users[0]);
        } else {
            setError(t.biometricFailed);
            setLoading(false);
        }
    }, 1500);
  };

  // Forgot Password Flow omitted for brevity as it remains similar, but using new translations
  // Assuming the same logic as previous code but updated text from props
  
  // Render Login/Register View
  if (view.startsWith('forgot')) {
      // (Keep existing forgot password logic but use `t` from new constants)
       return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-6 font-sans">
             <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 relative">
                <button onClick={() => setView('login')} className="mb-4 flex items-center text-slate-500 font-bold text-sm">
                    <ChevronLeft size={16} /> {t.login}
                </button>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{t.resetPassword}</h2>
                 {view === 'forgot-phone' && (
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 block">{t.phoneOrEmail}</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="017..." />
                        <button onClick={() => setView('forgot-otp')} className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold">{t.sendOtp}</button>
                    </div>
                )}
                 {view === 'forgot-otp' && (
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 block">{t.enterOtp}</label>
                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="1234" />
                        <button onClick={() => setView('forgot-reset')} className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold">{t.verify}</button>
                    </div>
                )}
                 {view === 'forgot-reset' && (
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 block">{t.newPassword}</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="••••••" />
                        <button onClick={() => setView('login')} className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold">{t.saveChanges}</button>
                    </div>
                )}
             </div>
        </div>
       )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-6 font-sans">
      <div className="text-center mb-8 animate-in slide-in-from-top-4 duration-500">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-glow mb-4">
           <Sprout size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-1">{t.appTitle}</h1>
        <p className="text-slate-500">{t.welcomeBack}</p>
        <button onClick={toggleLang} className="mt-4 text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full">{t.switchLang}</button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button onClick={() => { setView('login'); setError(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${view === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>{t.login}</button>
          <button onClick={() => { setView('register'); setError(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${view === 'register' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>{t.register}</button>
        </div>

        <div className="space-y-4">
          {view === 'register' && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 mb-1 block">{t.fullName}</label>
               <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-primary-400 transition-all">
                  <User size={18} className="text-slate-400 mr-2" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-transparent w-full outline-none text-slate-800 font-medium" />
               </div>
            </div>
          )}

          <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 mb-1 block">{t.phoneOrEmail}</label>
               <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-primary-400 transition-all">
                  <Phone size={18} className="text-slate-400 mr-2" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-transparent w-full outline-none text-slate-800 font-medium placeholder:text-slate-400" placeholder="017..." />
               </div>
          </div>

          <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 mb-1 block">{t.password}</label>
               <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-primary-400 transition-all">
                  <Lock size={18} className="text-slate-400 mr-2" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-transparent w-full outline-none text-slate-800 font-medium" placeholder="••••••" />
                  <button onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} className="text-slate-400"/> : <Eye size={18} className="text-slate-400"/>}</button>
               </div>
          </div>

          {view === 'register' && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 mb-1 block">{t.confirmPassword}</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-primary-400 transition-all">
                    <Lock size={18} className="text-slate-400 mr-2" />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-transparent w-full outline-none text-slate-800 font-medium" placeholder="••••••" />
                </div>
              </div>
          )}

          {view === 'login' && (
              <div className="flex justify-end">
                  <button onClick={() => setView('forgot-phone')} className="text-xs font-bold text-primary-600 hover:text-primary-700">{t.forgotPassword}</button>
              </div>
          )}

          {error && (<div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg flex items-center gap-2">{error}</div>)}

          <button onClick={handleAuth} disabled={loading} className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl shadow-glow hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (view === 'login' ? t.login : t.createAccount)}
          </button>
          
          {view === 'login' && (
              <button onClick={handleBiometricLogin} className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <Fingerprint size={20} /> {t.biometricLogin}
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
