import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Volume2, StopCircle, Sparkles } from 'lucide-react';
import { Language, ChatMessage } from '../types';
import { TRANSLATIONS } from '../constants';
import { generateChatResponse } from '../services/geminiService';

interface ChatProps {
  lang: Language;
}

const Chat: React.FC<ChatProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: lang === 'bn' ? 'নমস্কার! আমি কৃষিবন্ধু। আমি আপনাকে কিভাবে সাহায্য করতে পারি?' : 'Hello! I am KrishiBondhu. How can I help you today?',
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: m.text
      }));

      const responseText = await generateChatResponse(history, userMsg.text);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "Sorry, I couldn't understand.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: lang === 'bn' ? 'দুঃখিত, সংযোগে সমস্যা হচ্ছে।' : 'Sorry, connection error.',
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isSpeaking) {
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US'; 
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Date Divider (Mock) */}
        <div className="text-center">
           <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-1 rounded-full font-medium">Today</span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white mr-2 shadow-sm shrink-0">
                <Bot size={16} />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-2xl p-3.5 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
              
              {msg.role === 'model' && !msg.isError && (
                <div className="mt-2 flex justify-end">
                  <button 
                    onClick={() => speakText(msg.text)}
                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-50 rounded-full transition-colors"
                  >
                    {isSpeaking ? <StopCircle size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 ml-2 shadow-sm shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white mr-2 shadow-sm shrink-0">
                <Bot size={16} />
              </div>
            <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-slate-100">
               <div className="flex space-x-1.5">
                 <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0">
        <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-400 transition-all shadow-sm">
          <div className="p-2 text-primary-500">
            <Sparkles size={20} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.askAnything}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-800 placeholder:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-primary-600 text-white rounded-full disabled:opacity-50 hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;