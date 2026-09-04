import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Heart, Compass, Check, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { audioEngine } from '../services/audioService';
import { StationModalWrapper } from './StationModalWrapper';

interface NokhathaStationProps {
  onComplete: () => void;
  onBackToVillage: () => void;
}

interface SeaHazard {
  id: number;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  type: 'rock' | 'pearl' | 'wind';
}

const CREW_ROLES = [
  {
    title: 'النوخذة',
    badge: '⚓ القبطان',
    desc: 'قائد المحمل المسؤول الأول عن سلامة السفينة وتوجيه الدفة واختيار مغاصات اللؤلؤ.'
  },
  {
    title: 'النهّام',
    badge: '🎵 المنشد',
    desc: 'صاحب الصوت الشجي الذي يغني بالمواويل البحرية لبث الحماسة وتخفيف مشقة السفر عن البحارة.'
  },
  {
    title: 'الغوّاص',
    badge: '🤿 البطل',
    desc: 'الغائص في أعماق الهير بحثًا عن محار اللؤلؤ، يعتمد على شجاعته ولياقته العالية.'
  },
  {
    title: 'السيب',
    badge: '🪢 حبل النجاة',
    desc: 'رفيق الغواص المخلص فوق سطح السفينة الذي يمسك حبل الإيدة ويسحب الغواص سريعًا للسطح.'
  },
  {
    title: 'الطواش',
    badge: '💎 التاجر',
    desc: 'تاجر اللؤلؤ الذي يتنقل بين المحامل في عرض البحر لمعاينة اللؤلؤ وشراء الدانات الثمينة.'
  }
];

export const NokhathaStation: React.FC<NokhathaStationProps> = ({ onComplete, onBackToVillage }) => {
  const [safetyLives, setSafetyLives] = useState<number>(3);
  const [progressDistance, setProgressDistance] = useState<number>(0); // 0 to 100%
  const [collectedPearls, setCollectedPearls] = useState<number>(0);
  const [dhowX, setDhowX] = useState<number>(50); // 10% to 90%
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const hazardsRef = useRef<SeaHazard[]>([]);
  const animRef = useRef<number | null>(null);
  const nextHazardId = useRef<number>(1);

  useEffect(() => {
    audioEngine.setZone('nokhatha');
    audioEngine.speak('قُد المحمل القطري إلى مغاصات الهير، تفادَ الصخور واجمع اللؤلؤ وحافظ على سلامة الطاقم.');

    // Initial hazards
    hazardsRef.current = [
      { id: 1, x: 30, y: 15, type: 'pearl' },
      { id: 2, x: 70, y: 35, type: 'rock' },
      { id: 3, x: 45, y: 60, type: 'pearl' },
      { id: 4, x: 20, y: 80, type: 'rock' }
    ];

    let lastSpawn = Date.now();
    const gameLoop = () => {
      if (gameFinished) return;

      // Advance progress
      setProgressDistance((prev) => {
        if (prev >= 100) {
          setGameFinished(true);
          setShowQuiz(true);
          audioEngine.playSuccess();
          audioEngine.speak('وصلتم بسلام إلى مغاص الهير! الآن أجب عن سؤال النوخذة.');
          return 100;
        }
        return prev + 0.12;
      });

      // Move hazards down screen towards player dhow
      hazardsRef.current.forEach((h) => {
        h.y += 0.55;
      });

      // Collision checks with Dhow (Dhow is around y=80-88%)
      const dX = dhowX;
      hazardsRef.current = hazardsRef.current.filter((h) => {
        if (h.y >= 75 && h.y <= 90) {
          if (Math.abs(h.x - dX) < 15) {
            // Hit!
            if (h.type === 'rock') {
              audioEngine.playError();
              setSafetyLives((lives) => Math.max(1, lives - 1));
            } else if (h.type === 'pearl') {
              audioEngine.playPearlCollect('dana');
              setCollectedPearls((p) => p + 1);
            }
            return false;
          }
        }
        return h.y < 105;
      });

      // Spawn new items from top
      if (Date.now() - lastSpawn > 1100 && hazardsRef.current.length < 7) {
        hazardsRef.current.push({
          id: nextHazardId.current++,
          x: Math.random() * 70 + 15,
          y: -10,
          type: Math.random() > 0.45 ? 'rock' : 'pearl'
        });
        lastSpawn = Date.now();
      }

      animRef.current = requestAnimationFrame(gameLoop);
    };

    animRef.current = requestAnimationFrame(gameLoop);

    // Keyboard controls (Left / Right / A / D)
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        setDhowX((prev) => Math.max(15, prev - 7));
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        setDhowX((prev) => Math.min(85, prev + 7));
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('keydown', handleKey);
    };
  }, [gameFinished, dhowX]);

  const handleSteer = (dir: 'left' | 'right') => {
    if (dir === 'left') setDhowX((prev) => Math.max(15, prev - 10));
    if (dir === 'right') setDhowX((prev) => Math.min(85, prev + 10));
  };

  const handleAnswerQuiz = (choice: string) => {
    setQuizAnswer(choice);
    if (choice === 'النوخذة') {
      audioEngine.playSuccess();
      setQuizFeedback('إجابة صحيحة! النوخذة هو قبطان المحمل وقائده الحكيم.');
      setTimeout(() => {
        setIsCompleted(true);
      }, 1000);
    } else {
      audioEngine.playError();
      setQuizFeedback('إجابة غير صحيحة، تذكر دور القبطان وجرّب ثانية.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] w-full bg-gradient-to-b from-[#19425a] via-[#10344a] to-[#0a2333] p-3 md:p-5 text-[#F7F1E5] flex flex-col justify-between select-none overflow-hidden">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-amber-400/40 pb-2 mb-2">
        <button
          onClick={onBackToVillage}
          className="px-3 py-1.5 rounded-xl bg-[#513A2E] text-[#F7F1E5] font-bold text-xs md:text-sm flex items-center gap-1 hover:bg-[#3D291D]"
        >
          <ArrowRight className="w-4 h-4" />
          <span>القرية</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Health Lives */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-400 text-xs font-black">
            <span>فرص السلامة:</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < safetyLives ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`}
              />
            ))}
          </div>

          {/* Pearl Counter */}
          <div className="px-3 py-1 rounded-full bg-cyan-900/80 border border-cyan-400 text-xs font-black">
            اللآلئ: {collectedPearls} 💎
          </div>
        </div>

        {/* Voyage Progress to Heyr */}
        <div className="flex items-center gap-2 text-xs font-black">
          <Compass className="w-4 h-4 text-amber-300" />
          <span>المسافة للهير: {Math.floor(progressDistance)}%</span>
        </div>
      </div>

      {/* Main Voyage Screen & Crew Cards */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch my-auto">
        {/* Navigation Waters Area */}
        <div className="lg:col-span-8 relative h-[360px] md:h-[420px] rounded-3xl border-4 border-amber-600/70 overflow-hidden bg-gradient-to-b from-[#145374] via-[#093047] to-[#041a29] shadow-2xl">
          {/* Progress Bar Top */}
          <div className="w-full bg-black/40 h-2">
            <div
              className="bg-amber-400 h-full transition-all duration-200"
              style={{ width: `${progressDistance}%` }}
            />
          </div>

          {/* Sea water ripples */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_40px,rgba(255,255,255,0.05)_42px)] pointer-events-none" />

          {/* Rocks and Pearls Floating Towards Ship */}
          {hazardsRef.current.map((item) => (
            <div
              key={item.id}
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
            >
              {item.type === 'rock' ? (
                <div className="w-12 h-10 bg-[#3a2f2b] rounded-t-2xl rounded-b-lg border-2 border-stone-600 shadow-lg flex items-center justify-center">
                  <span className="text-xl">🪨</span>
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-cyan-200/40 ring-2 ring-cyan-300 shadow-lg flex items-center justify-center animate-pulse">
                  <span className="text-lg">💎</span>
                </div>
              )}
            </div>
          ))}

          {/* The Qatari Dhow Boat (محمل قطري تقليدي بسنبوك وشراع) */}
          <div
            className="absolute bottom-5 sm:bottom-6 transform -translate-x-1/2 transition-all duration-100 flex flex-col items-center pointer-events-none z-20"
            style={{ left: `${dhowX}%` }}
          >
            <div className="w-32 h-32 sm:w-36 sm:h-36 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                {/* Traditional triangular sail (الشراع المثلث القطري) */}
                <polygon points="50,10 85,60 50,60" fill="#F7F1E5" stroke="#D8C29D" strokeWidth="1.5" />
                {/* Sail seam line */}
                <line x1="50" y1="35" x2="68" y2="60" stroke="#E5D9C4" strokeWidth="1" strokeDasharray="2 2" />
                {/* Mast */}
                <line x1="50" y1="8" x2="50" y2="70" stroke="#513A2E" strokeWidth="3" strokeLinecap="round" />
                {/* Wooden Hull with Qatari Carved details */}
                <path d="M 12 70 Q 25 88 50 88 Q 75 88 92 68 L 86 64 L 16 64 Z" fill="#513A2E" stroke="#C7A15A" strokeWidth="2" />
                {/* Bow sprit (الدقل والصدر) */}
                <path d="M 86 64 L 98 56" stroke="#513A2E" strokeWidth="2.5" strokeLinecap="round" />
                {/* Qatari Flag on Stern */}
                <rect x="18" y="55" width="10" height="7" fill="#8A1538" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-black text-amber-200 bg-black/70 px-3 py-0.5 rounded-full border-2 border-amber-400 shadow-lg tracking-wide -mt-1">
              محمل قطر
            </span>
          </div>

          {/* Steer controls overlay for mobile */}
          <div className="absolute bottom-3 inset-x-0 flex justify-between px-4 z-30">
            <button
              onClick={() => handleSteer('left')}
              className="px-5 py-3 rounded-2xl bg-[#C7A15A] text-[#513A2E] font-black flex items-center gap-1 shadow-lg border-2 border-white active:scale-90"
            >
              <ChevronLeft className="w-6 h-6" />
              <span>يسار</span>
            </button>
            <button
              onClick={() => handleSteer('right')}
              className="px-5 py-3 rounded-2xl bg-[#C7A15A] text-[#513A2E] font-black flex items-center gap-1 shadow-lg border-2 border-white active:scale-90"
            >
              <span>يمين</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Crew Roles Educational Cards */}
        <div className="lg:col-span-4 bg-[#F7F1E5] p-4 rounded-3xl border-2 border-[#C7A15A] text-[#513A2E] shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-[#8A1538] mb-2 border-b border-[#C7A15A] pb-1">
              طاقم المحمل في رحلة الغوص القديمة:
            </h3>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {CREW_ROLES.map((role) => (
                <div key={role.title} className="p-2 rounded-xl bg-amber-50/80 border border-[#C7A15A]/60">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-extrabold text-sm text-[#8A1538]">{role.title}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#C7A15A]/40 text-[#513A2E]">
                      {role.badge}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#513A2E]/80 leading-relaxed">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* End of voyage quiz */}
          {showQuiz && (
            <div className="mt-3 p-3 bg-[#8A1538] text-white rounded-2xl border-2 border-[#C7A15A] animate-fadeIn shadow-lg">
              <div className="flex items-center gap-1 text-amber-300 font-black text-sm mb-1">
                <HelpCircle className="w-4 h-4" />
                <span>سؤال رحلة النوخذة:</span>
              </div>
              <p className="font-bold text-xs md:text-sm mb-3">من يقود المحمل؟</p>
              <div className="grid grid-cols-3 gap-1.5">
                {['الغواص', 'النوخذة', 'الطواش'].map((choice) => (
                  <button
                    key={choice}
                    onClick={() => handleAnswerQuiz(choice)}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition active:scale-95 border ${
                      quizAnswer === choice
                        ? choice === 'النوخذة'
                          ? 'bg-emerald-600 text-white border-white'
                          : 'bg-rose-700 text-white border-white'
                        : 'bg-[#F7F1E5] text-[#513A2E] hover:bg-amber-100'
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
              {quizFeedback && (
                <div className="mt-2 text-center text-xs font-bold text-amber-200">
                  {quizFeedback}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Completion Modal */}
      <StationModalWrapper
        isOpen={isCompleted}
        stationName="رحلة النوخذة"
        stamp="⛵"
        subtitle="عشت تجربة قيادة المحمل القطري وتعرفت على أدوار رجال البحر الأوفياء ونلت ختم النوخذة!"
        onContinue={() => {
          setIsCompleted(false);
          onComplete();
        }}
      />
    </div>
  );
};
