import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, Check, ArrowRight, Award } from 'lucide-react';
import { audioEngine } from '../services/audioService';
import { AbuRashidAvatar, AbuRashidDialogue } from './Characters';
import { GoldenSparklesCanvas } from './HeritagePatterns';
import { CertificateModal } from './CertificateModal';

interface TreasureScreenProps {
  onBackToVillage: () => void;
}

export const TreasureScreen: React.FC<TreasureScreenProps> = ({ onBackToVillage }) => {
  const [isChestOpen, setIsChestOpen] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [abuRashidMessage, setAbuRashidMessage] = useState<string>(
    'أحسنت! جمعت الأختام الخمسة وأصبحت جادًا ومستحقًا للقب حارس تراث قطر.'
  );

  useEffect(() => {
    audioEngine.setZone('none');
    audioEngine.playDoorOpen();
    audioEngine.playSuccess();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#8A1538', '#C7A15A', '#D8C29D', '#F7F1E5', '#FFFFFF']
      });
    } catch {
      // fallback
    }

    // Auto open chest after short delay
    setTimeout(() => {
      setIsChestOpen(true);
      audioEngine.playGoldenChime();
    }, 800);
  }, []);

  const handleTitleClick = () => {
    audioEngine.playSuccess();
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8A1538', '#C7A15A', '#F7F1E5']
      });
    } catch {
      // fallback
    }
    const celebrationMsg = 'مبروك! أنت الآن حارس تراث قطر.';
    setAbuRashidMessage(celebrationMsg);
    audioEngine.speak(celebrationMsg);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] w-full bg-gradient-to-b from-[#49111e] via-[#6e182e] to-[#2b0811] p-4 md:p-8 text-[#F7F1E5] flex flex-col justify-between items-center relative overflow-hidden select-none">
      {/* Floating Sparkles Canvas */}
      <GoldenSparklesCanvas count={50} />

      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-[#C7A15A]/60 pb-3 z-20">
        <button
          onClick={onBackToVillage}
          className="px-4 py-2 rounded-xl bg-[#513A2E] text-[#F7F1E5] font-bold text-xs md:text-sm flex items-center gap-1.5 hover:bg-[#3D291D] transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للقرية</span>
        </button>

        <div className="text-center">
          <div className="inline-block px-3 py-0.5 rounded-full bg-[#C7A15A] text-[#513A2E] text-xs font-black mb-1">
            اكتملت رحلة قطر لوّل!
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-amber-300 font-['Cairo'] drop-shadow">
            كنز قطر لوّل
          </h2>
        </div>

        <button
          onClick={() => setShowCertificate(true)}
          className="px-4 py-2 rounded-xl bg-[#C7A15A] text-[#513A2E] font-black text-xs md:text-sm flex items-center gap-1.5 hover:bg-[#d8b368] shadow-lg border-2 border-white transition active:scale-95"
        >
          <Award className="w-4 h-4 text-[#8A1538]" />
          <span>شهادة الإنجاز</span>
        </button>
      </div>

      {/* Center Stage: The Traditional Qatari Mandoos Chest */}
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center my-4 z-20">
        {/* Chest Illustration */}
        <div className="relative w-64 md:w-80 h-52 md:h-64 flex flex-col items-center justify-center">
          {/* Golden Radiance Aura behind chest */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-400/40 via-yellow-200/30 to-transparent rounded-full blur-2xl animate-pulse pointer-events-none" />

          {/* Antique Wooden Mandoos SVG */}
          <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-2xl overflow-visible">
            {/* Chest Lid (Lifts up when opened) */}
            <g className={`transition-transform duration-1000 origin-top ${isChestOpen ? '-translate-y-8 -rotate-12' : ''}`}>
              <path d="M 20 50 L 35 25 L 165 25 L 180 50 Z" fill="#513A2E" stroke="#C7A15A" strokeWidth="2.5" />
              {/* Brass Studs on Lid */}
              <circle cx="50" cy="38" r="3" fill="#C7A15A" />
              <circle cx="100" cy="35" r="4" fill="#C7A15A" />
              <circle cx="150" cy="38" r="3" fill="#C7A15A" />
            </g>

            {/* Glowing Pearls & Gems overflowing */}
            {isChestOpen && (
              <g className="animate-pulse">
                <circle cx="65" cy="48" r="8" fill="#FFFFFF" stroke="#C7A15A" />
                <circle cx="95" cy="42" r="10" fill="#FFE082" stroke="#8A1538" />
                <circle cx="130" cy="46" r="7" fill="#80DEEA" stroke="#C7A15A" />
                <circle cx="110" cy="50" r="9" fill="#FFFFFF" />
              </g>
            )}

            {/* Chest Body */}
            <rect x="20" y="50" width="160" height="90" rx="6" fill="#3D291D" stroke="#C7A15A" strokeWidth="3" />

            {/* Brass Inlays & Reinforcements */}
            <line x1="20" y1="80" x2="180" y2="80" stroke="#C7A15A" strokeWidth="2" strokeDasharray="6 4" />
            <line x1="20" y1="110" x2="180" y2="110" stroke="#C7A15A" strokeWidth="2" strokeDasharray="6 4" />
            <line x1="60" y1="50" x2="60" y2="140" stroke="#C7A15A" strokeWidth="3" />
            <line x1="140" y1="50" x2="140" y2="140" stroke="#C7A15A" strokeWidth="3" />

            {/* Center Golden Lock Plate (القفل النحاسي) */}
            <rect x="90" y="65" width="20" height="25" rx="3" fill="#C7A15A" stroke="#513A2E" strokeWidth="1.5" />
            <circle cx="100" cy="74" r="3" fill="#1A1A1A" />
            <polygon points="98,75 102,75 101,82 99,82" fill="#1A1A1A" />

            {/* Iron Feet */}
            <rect x="25" y="140" width="16" height="8" rx="2" fill="#1A1A1A" />
            <rect x="159" y="140" width="16" height="8" rx="2" fill="#1A1A1A" />
          </svg>
        </div>

        {/* The 5 Earned Stamps Display */}
        <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 my-3">
          {[
            { stamp: '🏺', label: 'سوق لوّل' },
            { stamp: '🌊', label: 'بحر اللؤلؤ' },
            { stamp: '⛵', label: 'رحلة النوخذة' },
            { stamp: '☕', label: 'مجلس لوّل' },
            { stamp: '🪀', label: 'فريج الألعاب' }
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center bg-[#F7F1E5]/90 border-2 border-[#C7A15A] rounded-2xl p-2 md:p-3 shadow-lg transform hover:scale-105 transition"
            >
              <span className="text-3xl md:text-4xl drop-shadow">{item.stamp}</span>
              <span className="text-[11px] md:text-xs font-black text-[#513A2E] mt-1">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* The Clickable Title Badge */}
        <div className="my-3 text-center">
          <button
            onClick={handleTitleClick}
            className="group px-6 md:px-10 py-4 rounded-3xl bg-gradient-to-r from-[#C7A15A] via-[#F5D77F] to-[#C7A15A] text-[#513A2E] font-black text-2xl md:text-4xl shadow-2xl border-4 border-[#F7F1E5] flex items-center gap-3 active:scale-95 transition-all transform hover:scale-105 cursor-pointer"
            title="انقر لتفعيل المؤثر الاحتفالي وسماع تهنئة أبو راشد!"
          >
            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-[#8A1538] group-hover:rotate-12 transition-transform" />
            <span>🏆 حارس تراث قطر</span>
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[#8A1538] animate-spin" />
          </button>

          {/* Activated Status & Message */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs md:text-sm flex items-center gap-1 shadow">
              <Check className="w-4 h-4" />
              <span>✓ تم التفعيل</span>
            </span>
            <span className="text-xs md:text-sm font-bold text-[#D8C29D]">
              تم فتح اللقب بنجاح — أنت الآن حارس تراث قطر. (اضغط على اللقب للاحتفال)
            </span>
          </div>
        </div>

        {/* Abu Rashid Guide congratulation speech */}
        <div className="mt-3 flex items-center gap-4 bg-[#F7F1E5] text-[#513A2E] p-4 rounded-3xl border-2 border-[#C7A15A] shadow-xl max-w-xl">
          <AbuRashidAvatar size={75} showName={false} />
          <div className="flex-1">
            <span className="text-xs font-black text-[#8A1538] block mb-1">
              المرشد أبو راشد:
            </span>
            <p className="text-sm md:text-base font-bold leading-relaxed">
              {abuRashidMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="max-w-xl mx-auto w-full flex flex-col sm:flex-row gap-3 z-20">
        <button
          onClick={() => setShowCertificate(true)}
          className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#8A1538] to-[#a01a43] text-white font-black text-base shadow-xl border-2 border-[#C7A15A] flex items-center justify-center gap-2 hover:bg-[#6b102b] active:scale-95"
        >
          <Award className="w-5 h-5 text-amber-300" />
          <span>استخراج شهادة حارس تراث قطر</span>
        </button>

        <button
          onClick={onBackToVillage}
          className="py-4 px-6 rounded-2xl bg-[#D8C29D] text-[#513A2E] font-black text-base hover:bg-[#ceb58c] active:scale-95 transition"
        >
          العودة للقرية التراثية
        </button>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
      />
    </div>
  );
};
