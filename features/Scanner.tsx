import React, { useState, useRef } from 'react';
import { Camera, Upload, X, AlertCircle, Scan } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { analyzePlantImage } from '../services/geminiService';

interface ScannerProps {
  lang: Language;
}

const Scanner: React.FC<ScannerProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const result = await analyzePlantImage(image);
      setAnalysis(result || "No result found.");
    } catch (error) {
      setAnalysis(lang === 'bn' ? "বিশ্লেষণে ত্রুটি হয়েছে। আবার চেষ্টা করুন।" : "Error analyzing image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-5 pb-24 min-h-screen bg-slate-50">
      
      {!image ? (
        <div className="flex flex-col h-[70vh] items-center justify-center">
          <div className="text-center space-y-2 mb-8">
             <h2 className="text-2xl font-bold text-slate-800">{t.scanPlant}</h2>
             <p className="text-slate-500 text-sm max-w-[250px] mx-auto">
               {lang === 'bn' ? 'রোগ নির্ণয়ের জন্য পাতার ছবি তুলুন' : 'Capture photo of the leaf to detect diseases'}
             </p>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative w-64 h-64 border-2 border-dashed border-primary-300 rounded-3xl flex flex-col items-center justify-center bg-white shadow-soft cursor-pointer hover:bg-primary-50 transition-colors group"
          >
            {/* Corner Markers for Viewfinder Effect */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg"></div>

            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
               <Camera size={32} className="text-primary-600" />
            </div>
            <span className="text-primary-700 font-semibold">{t.takePhoto}</span>
            <span className="text-slate-400 text-xs mt-1">{t.uploadImage}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="relative rounded-3xl overflow-hidden shadow-lg border-4 border-white">
            <img src={image} alt="Crop" className="w-full h-80 object-cover" />
            <button 
              onClick={clearImage}
              className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/80 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
               <p className="text-white text-sm font-medium">{t.scanPlant}</p>
            </div>
          </div>

          {!analysis && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-glow active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center space-x-2 text-lg"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t.analyzing}</span>
                </>
              ) : (
                <>
                  <Scan size={24} />
                  <span>{t.identifyDisease}</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Hidden Input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Analysis Result */}
      {analysis && (
        <div className="mt-4 bg-white rounded-3xl p-6 shadow-soft border border-slate-100 animate-in slide-in-from-bottom-5 duration-500">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
             <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
               <AlertCircle size={24} />
             </div>
             <h3 className="text-lg font-bold text-slate-800">
              {t.diseaseDetected}
            </h3>
          </div>
          <div className="prose prose-sm prose-emerald text-slate-600 leading-relaxed whitespace-pre-wrap">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;