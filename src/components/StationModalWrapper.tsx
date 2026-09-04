import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { audioEngine } from '../services/audioService';

interface StationModalWrapperProps {
  isOpen: boolean;
  stationName: string;
  stamp: string;
  subtitle?: string;
  onContinue: () => void;
  autoCloseSeconds?: number;
}

export const StationModalWrapper: React.FC<StationModalWrapperProps> = ({
  isOpen,
  stationName,
  stamp,
  subtitle = 'حصلت على ختم المحطة وانضممت خطوة أقرب للقب حارس تراث قطر!',
  onContinue,
  autoCloseSeconds = 4
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(autoCloseSeconds);

  useEffect(() => {
    if (!isOpen) return;

    // Trigger celebration sounds & confetti
    audioEngine.playSuccess();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8A1538', '#C7A15A', '#D8C29D', '#F7F1E5', '#513A2E']
      });
    } catch {
      // fallback
    }

    setSecondsLeft(autoCloseSeconds);

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isOpen, autoCloseSeconds, onContinue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#F7F1E5] rounded-3xl border-4 border-[#C7A15A] shadow-2xl p-6 md:p-8 text-center text-[#513A2E] overflow-hidden">
        {/* Top Moroccan/Qatari Gypsum decoration */}
        <div className="w-full h-3 bg-[#8A1538] absolute top-0 left-0" />

        {/* Checkmark Icon & Stamp Display */}
        <div className="relative my-4 flex justify-center items-center">
          {/* Glowing Golden Circle */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#C7A15A] to-[#F5D77F] border-4 border-[#8A1538] flex items-center justify-center shadow-xl animate-bounce">
            <span className="text-5xl drop-shadow-md">{stamp}</span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-2 border-2 border-white shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Big Title */}
        <h2 className="text-3xl md:text-4xl font-black text-[#8A1538] mb-2 font-['Cairo']">
          أكملت المهمة!
        </h2>

        {/* Station name and stamp banner */}
        <div className="my-3 py-2 px-4 rounded-xl bg-[#D8C29D]/40 border border-[#C7A15A] inline-block">
          <p className="text-lg md:text-xl font-black text-[#513A2E]">
            {stationName} {stamp}
          </p>
          <span className="text-xs font-bold text-emerald-800">✓ تم تسجيل الختم في جوازك</span>
        </div>

        <p className="text-sm md:text-base font-semibold text-[#513A2E]/90 mb-6 leading-relaxed">
          {subtitle}
        </p>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8A1538] via-[#a31a44] to-[#8A1538] text-[#F7F1E5] font-black text-lg md:text-xl shadow-lg border-2 border-[#C7A15A] flex items-center justify-center gap-2 hover:bg-[#6e102c] active:scale-95 transition-all"
        >
          <span>أكمل الرحلة</span>
          <ArrowLeft className="w-5 h-5 text-[#C7A15A]" />
        </button>

        {/* Auto Return Countdown Note */}
        <div className="mt-3 text-xs text-[#513A2E]/70 font-semibold">
          العودة التلقائية إلى القرية خلال {secondsLeft} ثوانٍ...
        </div>
      </div>
    </div>
  );
};
