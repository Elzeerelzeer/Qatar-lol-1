import React, { useState, useEffect } from 'react';
import { ArrowRight, Volume2, Sparkles, Maximize2, Coffee } from 'lucide-react';
import { audioEngine } from '../services/audioService';
import { StationModalWrapper } from './StationModalWrapper';
import { SaduBorder } from './HeritagePatterns';
import { Dallah3DModal } from './Dallah3DModal';
import { SouqAuctionGame } from './SouqAuctionGame';

interface SouqStationProps {
  onComplete: () => void;
  onBackToVillage: () => void;
}

export const SouqStation: React.FC<SouqStationProps> = ({ onComplete, onBackToVillage }) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isDallah3DModalOpen, setIsDallah3DModalOpen] = useState<boolean>(false);

  // Menhaz Pounding Interactive Challenge (3 strikes)
  const [menhazStrikes, setMenhazStrikes] = useState<number>(0);
  const [isStriking, setIsStriking] = useState<boolean>(false);

  // Audio Testing Panel State
  const [isAudioTesting, setIsAudioTesting] = useState<boolean>(false);
  const [audioTestStep, setAudioTestStep] = useState<string | null>(null);
  const [audioTestHistory, setAudioTestHistory] = useState<string[]>([]);

  useEffect(() => {
    audioEngine.init();
    audioEngine.setZone('souq');
    audioEngine.speak('أهلاً بك في سوق لوّل! ادخل مزاد أسرار سوق لوّل مع التاجر أبو راشد واكتشف مقتنيات الأجداد وأصواتها الأصيلة.');
  }, []);

  // Dedicated Audio Test for Souq Lawwal
  const handleTestSouqAudio = () => {
    if (isAudioTesting) return;
    setIsAudioTesting(true);
    setAudioTestHistory([]);
    setAudioTestStep('بدء فحص الصوت في سوق لوّل...');

    audioEngine.testSouqAudio((step) => {
      setAudioTestStep(step);
      setAudioTestHistory((prev) => [...prev, step]);
    });

    setTimeout(() => {
      setIsAudioTesting(false);
      setAudioTestStep('✓ اكتمل فحص جميع أصوات سوق لوّل بنجاح!');
    }, 4500);
  };

  // Menhaz Strike Challenge
  const handleStrikeMenhaz = () => {
    if (isStriking) return;
    setIsStriking(true);
    audioEngine.playMenhazStrike();

    const nextStrikes = menhazStrikes + 1;
    setMenhazStrikes(nextStrikes);

    setTimeout(() => {
      setIsStriking(false);
    }, 300);

    if (nextStrikes >= 3) {
      setTimeout(() => {
        audioEngine.playSuccess();
        audioEngine.speak('ما شاء الله! دقت القهوة بالمنحاز على أصولها، مبارك لك إتقان رنة المنحاز التراثية!');
      }, 500);
    }
  };

  const handleGameComplete = () => {
    setIsCompleted(true);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#F7F1E5] p-3 md:p-6 text-[#513A2E] flex flex-col justify-between select-none relative overflow-hidden font-['Cairo',sans-serif]" dir="rtl">
      {/* Background Ornaments */}
      <div className="absolute inset-2 md:inset-6 border-[8px] md:border-[12px] border-[#D8C29D] opacity-35 plaster-border rounded-2xl pointer-events-none z-0" />
      <div className="absolute inset-0 pointer-events-none opacity-20 geometric-glow z-0" />

      {/* Decorative Sadu Border Header */}
      <div className="max-w-6xl mx-auto w-full z-10 mb-2">
        <SaduBorder />
      </div>

      {/* Top Station Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b-2 border-[#C7A15A] pb-3 mb-4 z-10">
        <button
          onClick={onBackToVillage}
          className="px-3 md:px-4 py-2 rounded-xl bg-[#513A2E] text-[#F7F1E5] font-bold text-xs md:text-sm flex items-center gap-1.5 hover:bg-[#3D291D] transition shadow active:scale-95 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للقرية</span>
        </button>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black text-[#8A1538] flex items-center justify-center gap-2">
            <span>سوق لوّل</span>
            <span>🏺</span>
          </h2>
          <span className="text-xs md:text-sm font-bold text-[#513A2E]/80">
            مزاد أسرار سوق لوّل وأصوات مقتنيات الأجداد التراثية
          </span>
        </div>

        {/* Action Controls: Test Souq Audio & Dallah 3D Shortcut */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDallah3DModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#513A2E] font-black text-xs md:text-sm flex items-center gap-1.5 shadow border border-amber-600 transition active:scale-95 cursor-pointer"
            title="فتح مجسم الدلة 3D التفاعلي"
          >
            <Sparkles className="w-4 h-4 text-[#8A1538]" />
            <span className="hidden sm:inline">الدلة 3D 🫖</span>
          </button>

          <button
            onClick={handleTestSouqAudio}
            disabled={isAudioTesting}
            className={`px-3 md:px-4 py-2 rounded-xl font-black text-xs md:text-sm flex items-center gap-1.5 shadow-md border-2 transition active:scale-95 cursor-pointer ${
              isAudioTesting
                ? 'bg-amber-400 text-[#8A1538] border-[#8A1538] animate-pulse'
                : 'bg-[#8A1538] hover:bg-[#70102d] text-white border-[#C7A15A]'
            }`}
            title="اختبر صوت سوق لوّل (المنحاز، القهوة، الفخار، وأبو راشد)"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span>{isAudioTesting ? 'جارٍ فحص الصوت...' : 'اختبر الصوت في سوق لوّل 🔊'}</span>
          </button>
        </div>
      </div>

      {/* Audio Testing Live Banner (when active or recently tested) */}
      {audioTestStep && (
        <div className="max-w-6xl mx-auto w-full mb-3 z-10">
          <div className="bg-[#8A1538] text-white p-3 rounded-2xl border-2 border-[#C7A15A] shadow-lg flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-xs md:text-sm">
                اختبار الصوت في سوق لوّل:
              </span>
              <span className="bg-white/20 px-3 py-0.5 rounded-full font-black text-xs text-amber-300">
                {audioTestStep}
              </span>
            </div>
            {audioTestHistory.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-amber-200">
                {audioTestHistory.map((step, idx) => (
                  <span key={idx} className="bg-black/20 px-2 py-0.5 rounded">
                    ✓ {step}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Interactive Auction Game Section: «مزاد أسرار سوق لوّل» */}
      <div className="max-w-6xl mx-auto w-full z-10 mb-4">
        <SouqAuctionGame
          onCompleteStation={handleGameComplete}
          onOpenDallah3D={() => setIsDallah3DModalOpen(true)}
        />
      </div>

      {/* Secondary Station Craft Feature: Menhaz Pounding Interactive Challenge (تحدي دقة القهوة بالمنحاز 3 ضربات) */}
      <div className="max-w-6xl mx-auto w-full z-10 mb-2">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-[#F7F1E5] border-2 border-[#C7A15A] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl bg-[#C7A15A] text-[#8A1538] flex items-center justify-center text-xl shadow transition-transform ${isStriking ? 'scale-125 rotate-12' : ''}`}>
              🔔
            </div>
            <div>
              <h4 className="font-black text-sm sm:text-base text-[#8A1538]">
                تحدي دقة القهوة بالمنحاز التراثي (3 ضربات):
              </h4>
              <p className="text-xs text-[#513A2E] font-bold">
                اضغط لدق القهوة بالمنحاز النحاسي وسماع رنته الموسيقية الأصيلة في فناء السوق
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border border-[#8A1538] transition-colors ${
                    i < menhazStrikes ? 'bg-[#8A1538]' : 'bg-white'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleStrikeMenhaz}
              disabled={menhazStrikes >= 3}
              className={`px-4 py-2 rounded-xl font-black text-xs md:text-sm shadow transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                menhazStrikes >= 3
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#8A1538] hover:bg-[#72112e] text-white border border-[#C7A15A]'
              }`}
            >
              <span>{menhazStrikes >= 3 ? 'أحسنت! رنة المنحاز اكتملت ✓' : `دُق المنحاز (${menhazStrikes}/3) 🔨`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Dallah Modal */}
      <Dallah3DModal
        isOpen={isDallah3DModalOpen}
        onClose={() => setIsDallah3DModalOpen(false)}
      />

      {/* Completion Modal */}
      <StationModalWrapper
        isOpen={isCompleted}
        stationName="سوق لوّل"
        stamp="🏺"
        subtitle="أحسنت! أتممت مزاد أسرار سوق لوّل بنجاح وأعدت مقتنيات الأجداد إلى أماكنها الصحيحة."
        onContinue={() => {
          setIsCompleted(false);
          onComplete();
        }}
      />
    </div>
  );
};
