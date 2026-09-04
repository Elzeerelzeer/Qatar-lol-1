import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, RotateCcw, CheckCircle2, Play } from 'lucide-react';
import { audioEngine } from '../services/audioService';
import { StationModalWrapper } from './StationModalWrapper';
import { SaqlahGame } from './SaqlahGame';

interface FereejStationProps {
  onComplete: () => void;
  onBackToVillage: () => void;
}

export const FereejStation: React.FC<FereejStationProps> = ({ onComplete, onBackToVillage }) => {
  const [completedGames, setCompletedGames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'teelah' | 'dahroui' | 'saqlah'>('teelah');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // --- 1. AL-TEELAH GAME STATE ---
  const [teelahTimeLeft, setTeelahTimeLeft] = useState<number>(10);
  const [teelahHits, setTeelahHits] = useState<number>(0);
  const [teelahRunning, setTeelahRunning] = useState<boolean>(false);
  const [teelahPos, setTeelahPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const teelahDebounce = useRef<boolean>(false);
  const teelahTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 2. AL-DAHROUI GAME STATE ---
  const [dahrouiDistance, setDahrouiDistance] = useState<number>(0);
  const [dahrouiRunning, setDahrouiRunning] = useState<boolean>(false);

  useEffect(() => {
    audioEngine.setZone('fereej');
    audioEngine.speak('مرحبًا بك في فريج ألعاب قطر لوّل! أنجز أي لعبتين لتنال ختم الفريج.');

    return () => {
      if (teelahTimerRef.current) clearInterval(teelahTimerRef.current);
    };
  }, []);

  // Monitor completed games: Trigger immediate victory when ANY 2 games are finished!
  useEffect(() => {
    if (completedGames.length >= 2 && !isCompleted) {
      // Stop all game timers
      if (teelahTimerRef.current) clearInterval(teelahTimerRef.current);
      setTeelahRunning(false);
      setDahrouiRunning(false);

      audioEngine.playSuccess();
      setIsCompleted(true);
    }
  }, [completedGames, isCompleted]);

  const markGameCompleted = (gameName: string) => {
    if (!completedGames.includes(gameName)) {
      setCompletedGames((prev) => [...prev, gameName]);
    }
  };

  // --- TEELAH LOGIC ---
  const startTeelah = () => {
    if (teelahTimerRef.current) clearInterval(teelahTimerRef.current);
    setTeelahHits(0);
    setTeelahTimeLeft(10);
    setTeelahRunning(true);
    teelahDebounce.current = false;

    teelahTimerRef.current = setInterval(() => {
      setTeelahTimeLeft((prev) => {
        if (prev <= 1) {
          if (teelahTimerRef.current) clearInterval(teelahTimerRef.current);
          setTeelahRunning(false);
          audioEngine.playError();
          return 0;
        }
        // Randomly move marble inside play bounds
        setTeelahPos({
          x: Math.random() * 70 + 15,
          y: Math.random() * 70 + 15
        });
        return prev - 1;
      });
    }, 1000);
  };

  const handleHitTeelah = () => {
    if (!teelahRunning || teelahDebounce.current) return;

    // Prevent double clicking within 400ms
    teelahDebounce.current = true;
    setTimeout(() => {
      teelahDebounce.current = false;
    }, 400);

    audioEngine.playMarbleClick();
    const nextHits = teelahHits + 1;
    setTeelahHits(nextHits);

    // Jump marble on hit
    setTeelahPos({
      x: Math.random() * 70 + 15,
      y: Math.random() * 70 + 15
    });

    if (nextHits >= 3) {
      if (teelahTimerRef.current) clearInterval(teelahTimerRef.current);
      setTeelahRunning(false);
      audioEngine.playSuccess();
      markGameCompleted('teelah');
    }
  };

  // --- DAHROUI LOGIC ---
  const handlePushDahroui = () => {
    if (completedGames.includes('dahroui')) return;
    setDahrouiRunning(true);
    audioEngine.playMarbleClick();
    const next = dahrouiDistance + 20;
    setDahrouiDistance(next);

    if (next >= 100) {
      audioEngine.playSuccess();
      markGameCompleted('dahroui');
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] w-full bg-gradient-to-b from-[#442c21] via-[#2f1b12] to-[#1a0f0a] p-3 md:p-6 text-[#F7F1E5] flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-[#C7A15A]/60 pb-3 mb-3">
        <button
          onClick={onBackToVillage}
          className="px-3 py-1.5 rounded-xl bg-[#8A1538] text-[#F7F1E5] font-bold text-xs md:text-sm flex items-center gap-1.5 hover:bg-[#6b102b] transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للقرية</span>
        </button>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black text-[#F7F1E5] flex items-center justify-center gap-2">
            <span>فريج الألعاب الشعبية</span>
            <span className="text-2xl">🪀</span>
          </h2>
          <span className="text-xs md:text-sm font-bold text-[#D8C29D]">
            المطلوب: إنجاز أي لعبتين فقط للحصول على الختم!
          </span>
        </div>

        {/* Progress Counter */}
        <div className="px-3 py-1.5 rounded-full bg-[#C7A15A] text-[#513A2E] font-black text-xs md:text-sm border-2 border-white shadow">
          الألعاب المنجزة: {completedGames.length} / 2
        </div>
      </div>

      {/* Tabs for the 3 Folk Games */}
      <div className="max-w-4xl mx-auto w-full flex justify-center gap-2 mb-4">
        {[
          { id: 'teelah', name: 'لعبة التيلة 🔮' },
          { id: 'dahroui', name: 'لعبة الدحروي 🛞' },
          { id: 'saqlah', name: 'لعبة الصقلة 🪨' }
        ].map((tab) => {
          const isDone = completedGames.includes(tab.id);
          const isCurrent = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'teelah' | 'dahroui' | 'saqlah')}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs md:text-sm transition flex items-center gap-2 border-2 ${
                isCurrent
                  ? 'bg-[#C7A15A] text-[#513A2E] border-white shadow-lg'
                  : 'bg-[#513A2E]/80 text-[#D8C29D] border-[#C7A15A]/50 hover:bg-[#513A2E]'
              }`}
            >
              <span>{tab.name}</span>
              {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Active Game Screen */}
      <div className="max-w-4xl mx-auto w-full bg-[#F7F1E5] rounded-3xl border-4 border-[#C7A15A] p-5 text-[#513A2E] shadow-2xl my-auto">
        {/* GAME 1: AL-TEELAH */}
        {activeTab === 'teelah' && (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full border-b border-[#C7A15A] pb-2 mb-3">
              <div>
                <h3 className="text-xl font-black text-[#8A1538]">لعبة التيلة</h3>
                <p className="text-xs text-[#513A2E]/80 font-bold">
                  اضغط على التيلة الزجاجية 3 مرات خلال 10 ثوانٍ!
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#8A1538] text-white font-black text-xs">
                  الوقت: {teelahTimeLeft}ث
                </span>
                <span className="px-3 py-1 rounded-full bg-[#C7A15A] text-[#513A2E] font-black text-xs">
                  الإصابات: {teelahHits} / 3
                </span>
                <button
                  onClick={startTeelah}
                  className="px-3 py-1 rounded-full bg-[#513A2E] text-[#F7F1E5] font-bold text-xs flex items-center gap-1 hover:bg-[#3D291D]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة الجولة</span>
                </button>
              </div>
            </div>

            {/* Teelah Sand Pitch */}
            <div className="relative w-full h-[280px] bg-gradient-to-b from-[#e3cda8] to-[#cbb28b] rounded-2xl border-4 border-[#8A1538]/30 overflow-hidden shadow-inner flex items-center justify-center">
              {/* Sandy texture ripples */}
              <div className="absolute inset-0 bg-[radial-gradient(#8A1538_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

              {!teelahRunning && teelahHits < 3 && (
                <div className="text-center z-10">
                  <button
                    onClick={startTeelah}
                    className="px-6 py-3 rounded-2xl bg-[#8A1538] text-[#F7F1E5] font-black text-base shadow-xl flex items-center gap-2 border-2 border-[#C7A15A] hover:scale-105 active:scale-95 transition"
                  >
                    <Play className="w-5 h-5 text-amber-300" />
                    <span>ابدأ جولة التيلة</span>
                  </button>
                </div>
              )}

              {teelahHits >= 3 && (
                <div className="text-center z-10 bg-emerald-500/90 text-white px-6 py-4 rounded-2xl shadow-xl border-2 border-white">
                  <span className="text-2xl font-black block mb-1">🎉 أحسنت!</span>
                  <span className="text-sm font-bold">أنجزت لعبة التيلة بنجاح.</span>
                </div>
              )}

              {/* The Moving Marble (التيلة) */}
              {teelahRunning && (
                <button
                  onClick={handleHitTeelah}
                  className="absolute w-20 h-20 rounded-full transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 active:scale-90 shadow-2xl flex items-center justify-center cursor-pointer select-none"
                  style={{
                    left: `${teelahPos.x}%`,
                    top: `${teelahPos.y}%`,
                    background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #38bdf8 35%, #0284c7 70%, #0369a1 100%)',
                    boxShadow: '0 8px 25px rgba(2, 132, 199, 0.6), inset 0 2px 6px rgba(255,255,255,0.8)'
                  }}
                  title="اضغط على التيلة!"
                >
                  <div className="w-5 h-5 rounded-full bg-white/70 blur-[1px]" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* GAME 2: AL-DAHROUI */}
        {activeTab === 'dahroui' && (
          <div className="flex flex-col items-center">
            <div className="w-full border-b border-[#C7A15A] pb-2 mb-3">
              <h3 className="text-xl font-black text-[#8A1538]">لعبة الدحروي</h3>
              <p className="text-xs text-[#513A2E]/80 font-bold">
                ادفع الدحروي (الإطار الحديدي بالعصا) ليوصله إلى خط النهاية!
              </p>
            </div>

            <div className="w-full bg-[#E5D7C2] p-4 rounded-2xl border-2 border-[#C7A15A] mb-4">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>البداية</span>
                <span>المسافة: {dahrouiDistance}%</span>
                <span>خط النهاية 🏁</span>
              </div>
              <div className="w-full bg-[#D1BEA1] h-6 rounded-full overflow-hidden p-1">
                <div
                  className="bg-[#8A1538] h-full rounded-full transition-all duration-300"
                  style={{ width: `${dahrouiDistance}%` }}
                />
              </div>
            </div>

            {dahrouiDistance < 100 ? (
              <button
                onClick={handlePushDahroui}
                className="px-8 py-4 rounded-2xl bg-[#8A1538] text-white font-black text-lg shadow-xl border-2 border-[#C7A15A] active:scale-95 transition"
              >
                🛞 ادفع الدحروي للأمام!
              </button>
            ) : (
              <div className="p-4 bg-emerald-100 text-emerald-900 rounded-2xl font-black border border-emerald-400">
                🎉 ممتاز! وصلت إلى خط النهاية بالدحروي.
              </div>
            )}
          </div>
        )}

        {/* GAME 3: AL-SAQLAH */}
        {activeTab === 'saqlah' && (
          <SaqlahGame
            onComplete={() => markGameCompleted('saqlah')}
            isAlreadyCompleted={completedGames.includes('saqlah')}
          />
        )}
      </div>

      {/* Completion Modal triggered as soon as ANY 2 games are completed */}
      <StationModalWrapper
        isOpen={isCompleted}
        stationName="فريج الألعاب"
        stamp="🪀"
        subtitle="أنجزت لعبتين من ألعاب الفريج وحصلت على الختم."
        onContinue={() => {
          setIsCompleted(false);
          onComplete();
        }}
      />
    </div>
  );
};
