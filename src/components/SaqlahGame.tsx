import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RotateCcw, Volume2, Trophy, Hand, ShieldAlert, ArrowUp } from 'lucide-react';
import { audioEngine } from '../services/audioService';

interface SaqlahGameProps {
  onComplete: () => void;
  isAlreadyCompleted?: boolean;
}

// 4 Ground Pebbles with varied realistic desert hues and coordinates on the circular mat
interface GroundPebble {
  id: number;
  x: number; // percentage on mat
  y: number;
  size: number;
  rotation: number;
  colorType: 'sand' | 'limestone' | 'flint' | 'desert';
  isCollected: boolean;
}

const INITIAL_GROUND_PEBBLES: GroundPebble[] = [
  { id: 1, x: 28, y: 35, size: 36, rotation: 15, colorType: 'sand', isCollected: false },
  { id: 2, x: 70, y: 32, size: 34, rotation: -25, colorType: 'limestone', isCollected: false },
  { id: 3, x: 32, y: 68, size: 38, rotation: 40, colorType: 'flint', isCollected: false },
  { id: 4, x: 68, y: 65, size: 35, rotation: -10, colorType: 'desert', isCollected: false },
];

export const SaqlahGame: React.FC<SaqlahGameProps> = ({ onComplete, isAlreadyCompleted = false }) => {
  // Current Round (1: Single catch, 2: Double catch, 3: Final sweep)
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [groundPebbles, setGroundPebbles] = useState<GroundPebble[]>(INITIAL_GROUND_PEBBLES);
  const [snatchedInFlight, setSnatchedInFlight] = useState<number[]>([]);

  // Tossing Pebble State
  const [tossState, setTossState] = useState<'idle' | 'airborne' | 'success_catch' | 'missed'>('idle');
  const [airTimeRemaining, setAirTimeRemaining] = useState<number>(100); // 100% down to 0%
  const [gameFinished, setGameFinished] = useState<boolean>(isAlreadyCompleted);
  const [statusMessage, setStatusMessage] = useState<string>(
    'الجولة الأولى (الواحد): ارمِ حصاة الطيرة والتقط حصاة واحدة من الأرض قبل هبوطها!'
  );

  const tossTimerRef = useRef<NodeJS.Timeout | null>(null);
  const airIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Required catches for current round
  const requiredCatchesForRound = (round: number): number => {
    if (round === 1) return 1;
    if (round === 2) return 2;
    return 1; // Round 3 collects the remaining 1 (or all remaining)
  };

  useEffect(() => {
    return () => {
      if (tossTimerRef.current) clearTimeout(tossTimerRef.current);
      if (airIntervalRef.current) clearInterval(airIntervalRef.current);
    };
  }, []);

  // Launch the airborne pebble
  const handleToss = () => {
    if (tossState === 'airborne' || gameFinished) return;

    if (tossTimerRef.current) clearTimeout(tossTimerRef.current);
    if (airIntervalRef.current) clearInterval(airIntervalRef.current);

    setTossState('airborne');
    setSnatchedInFlight([]);
    setAirTimeRemaining(100);
    audioEngine.playMarbleClick();

    const required = requiredCatchesForRound(currentRound);
    setStatusMessage(
      `الحصاة في الهواء! التقط ${required === 1 ? 'حصاة واحدة' : 'حصاتين'} من الأرض بسرعة قبل سقوطها!`
    );

    // Countdown animation over 2400ms (generous window for all players)
    const totalDuration = 2400;
    const intervalStep = 50;
    let elapsed = 0;

    airIntervalRef.current = setInterval(() => {
      elapsed += intervalStep;
      const pct = Math.max(0, 100 - (elapsed / totalDuration) * 100);
      setAirTimeRemaining(pct);
    }, intervalStep);

    // Timeout when stone falls back down
    tossTimerRef.current = setTimeout(() => {
      if (airIntervalRef.current) clearInterval(airIntervalRef.current);

      // Check if player snatched enough pebbles
      setSnatchedInFlight((currentSnatched) => {
        const requiredCount = requiredCatchesForRound(currentRound);

        if (currentSnatched.length >= requiredCount) {
          // Success catch!
          handleRoundSuccess(currentSnatched);
        } else {
          // Missed catch
          handleRoundFail();
        }
        return currentSnatched;
      });
    }, totalDuration);
  };

  // Click on a ground pebble to snatch it while stone is airborne
  const handleSnatchPebble = (pebbleId: number) => {
    if (tossState !== 'airborne') {
      setStatusMessage('ارمِ حصاة الطيرة أولاً، ثم التقط الحصوات وهي في الهواء!');
      return;
    }

    if (snatchedInFlight.includes(pebbleId)) return;

    const required = requiredCatchesForRound(currentRound);
    if (snatchedInFlight.length >= required) return;

    audioEngine.playMarbleClick();
    const updatedSnatched = [...snatchedInFlight, pebbleId];
    setSnatchedInFlight(updatedSnatched);

    if (updatedSnatched.length >= required) {
      setStatusMessage('ممتاز! التقطت المطلوب، انتظر هبوط حصاة الطيرة لتقبض عليها!');
    } else {
      setStatusMessage(`التقطت واحدة! باقٍ لك ${required - updatedSnatched.length} أخرى بسرعة!`);
    }
  };

  // Quick snatch button for accessibility/young children
  const handleQuickSnatch = () => {
    if (tossState !== 'airborne') {
      handleToss();
      return;
    }

    const availablePebbles = groundPebbles.filter(
      (p) => !p.isCollected && !snatchedInFlight.includes(p.id)
    );
    const required = requiredCatchesForRound(currentRound);
    const needed = required - snatchedInFlight.length;

    if (needed > 0 && availablePebbles.length > 0) {
      const toSnatch = availablePebbles.slice(0, needed).map((p) => p.id);
      toSnatch.forEach((id) => handleSnatchPebble(id));
    }
  };

  const handleRoundSuccess = (snatchedIds: number[]) => {
    audioEngine.playSuccess();
    setTossState('success_catch');

    // Permanently mark these pebbles as collected
    setGroundPebbles((prev) =>
      prev.map((p) => (snatchedIds.includes(p.id) ? { ...p, isCollected: true } : p))
    );

    if (currentRound === 1) {
      setStatusMessage('أحسنت! أتقنت رمية «الواحد». استعد للجولة الثانية: «المثنى»!');
      audioEngine.speak('ما شاء الله! خفة يد وسرعة بديهة. الآن حان دور المثنى!');
      setTimeout(() => {
        setCurrentRound(2);
        setTossState('idle');
        setSnatchedInFlight([]);
        setStatusMessage('الجولة الثانية (المثنى): ارمِ الحصاة والتقط حصاتين معاً بسرعة وخفة!');
      }, 1800);
    } else if (currentRound === 2) {
      setStatusMessage('رائع جدًا! أتقنت «المثنى». الآن الجولة الثالثة: «الجمع والختام»!');
      audioEngine.speak('ممتاز! التقطت حصاتين ببراعة. الجولة الأخيرة لجمع الصقلة كلها!');
      setTimeout(() => {
        setCurrentRound(3);
        setTossState('idle');
        setSnatchedInFlight([]);
        setStatusMessage('الجولة الثالثة (الجمع): ارمِ الحصاة والتقط آخر حصاة واقبض الصقلة كاملة!');
      }, 1800);
    } else {
      // Finished all 3 rounds!
      setGameFinished(true);
      setStatusMessage('🎉 مبارك! أتقنت لعبة الصقلة الشعبية بكل براعة ونلت وسام الصقلة!');
      audioEngine.speak('عاشت إيدك! أتقنت لعبة الصقلة وحفظت مهارة آبائنا وأجدادنا في الفريج.');
      onComplete();
    }
  };

  const handleRoundFail = () => {
    audioEngine.playError();
    setTossState('missed');
    setStatusMessage('سقطت الحصاة قبل إكمال الالتقاط! حاول مرة ثانية، التكرار يعلّم الشطار.');

    setTimeout(() => {
      setTossState('idle');
      setSnatchedInFlight([]);
      const required = requiredCatchesForRound(currentRound);
      setStatusMessage(
        `أعد المحاولة في الجولة ${currentRound === 1 ? 'الأولى' : currentRound === 2 ? 'الثانية' : 'الثالثة'}: ارمِ والتقط ${required === 1 ? 'حصاة واحدة' : 'حصاتين'}.`
      );
    }, 1600);
  };

  const handleResetGame = () => {
    if (tossTimerRef.current) clearTimeout(tossTimerRef.current);
    if (airIntervalRef.current) clearInterval(airIntervalRef.current);
    setCurrentRound(1);
    setGroundPebbles(INITIAL_GROUND_PEBBLES);
    setSnatchedInFlight([]);
    setTossState('idle');
    setAirTimeRemaining(100);
    setGameFinished(false);
    setStatusMessage('الجولة الأولى (الواحد): ارمِ حصاة الطيرة والتقط حصاة واحدة من الأرض قبل هبوطها!');
  };

  // Helper to render realistic Qatari desert pebble graphic
  const renderPebbleSVG = (
    colorType: GroundPebble['colorType'] | 'tossing',
    size: number,
    isSelected = false,
    isAirborne = false
  ) => {
    const gradients = {
      sand: { c1: '#EAD7B7', c2: '#C9A979', c3: '#8E6E45', stroke: '#6B4E2B' },
      limestone: { c1: '#F4EFE6', c2: '#D7C7AF', c3: '#9B8B74', stroke: '#5F513F' },
      flint: { c1: '#D6CBC1', c2: '#9B897A', c3: '#5C4A3C', stroke: '#362B22' },
      desert: { c1: '#F1D1A6', c2: '#C59365', c3: '#7D4D28', stroke: '#4D2B13' },
      tossing: { c1: '#FFF3DB', c2: '#E0B86F', c3: '#8F6623', stroke: '#513A2E' },
    };
    const g = gradients[colorType];

    return (
      <svg
        viewBox="0 0 60 50"
        style={{ width: `${size}px`, height: `${(size * 50) / 60}px` }}
        className={`transition-all duration-200 drop-shadow-md ${
          isSelected ? 'ring-4 ring-amber-400 rounded-full scale-110' : ''
        } ${isAirborne ? 'drop-shadow-2xl' : ''}`}
      >
        <defs>
          <radialGradient id={`pebble-grad-${colorType}`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor={g.c1} />
            <stop offset="55%" stopColor={g.c2} />
            <stop offset="100%" stopColor={g.c3} />
          </radialGradient>
          <filter id="pebble-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="3" stdDeviation="2" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Natural organic smooth pebble path */}
        <path
          d="M 12 22 C 10 10, 32 6, 45 12 C 54 17, 56 34, 46 42 C 34 48, 18 45, 12 36 C 8 28, 10 26, 12 22 Z"
          fill={`url(#pebble-grad-${colorType})`}
          stroke={g.stroke}
          strokeWidth="2"
        />

        {/* Natural pebble specular highlights and subtle texture */}
        <ellipse cx="28" cy="16" rx="9" ry="4" fill="rgba(255,255,255,0.45)" transform="rotate(-15 28 16)" />
        <circle cx="38" cy="24" r="1.5" fill="rgba(255,255,255,0.25)" />
        <circle cx="20" cy="30" r="1.2" fill="rgba(0,0,0,0.15)" />
      </svg>
    );
  };

  const collectedCount = groundPebbles.filter((p) => p.isCollected).length;

  return (
    <div className="flex flex-col items-center text-center w-full max-w-2xl mx-auto" dir="rtl">
      {/* Header and Round Bar */}
      <div className="w-full border-b border-[#C7A15A]/60 pb-3 mb-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="text-right">
          <h3 className="text-xl font-black text-[#8A1538] flex items-center gap-2">
            <span>لعبة الصقلة الشعبية</span>
            <span className="text-sm bg-amber-200 text-[#8A1538] px-2.5 py-0.5 rounded-full border border-[#C7A15A] font-bold">
              5 حصوات
            </span>
          </h3>
          <p className="text-xs text-[#513A2E] font-bold mt-0.5">
            لعبة الأصالة وخفة اليد: ارمِ حصاة الطيرة والتقط حصوات الأرض بحركة متقنة!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* 3 Heritage Rounds Indicator */}
          <div className="flex items-center gap-1.5 bg-[#FAF6EE] px-3 py-1.5 rounded-2xl border-2 border-[#C7A15A] shadow-sm">
            <span className="text-xs font-black text-[#513A2E] ml-1">الجولة:</span>
            {[1, 2, 3].map((r) => (
              <div
                key={r}
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                  currentRound === r && !gameFinished
                    ? 'bg-[#8A1538] text-amber-200 ring-2 ring-amber-400 scale-105'
                    : currentRound > r || gameFinished
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                {currentRound > r || gameFinished ? '✓' : r}
              </div>
            ))}
          </div>

          <button
            onClick={handleResetGame}
            className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#8A1538] border border-[#C7A15A] shadow transition active:scale-95 cursor-pointer"
            title="إعادة بدء اللعبة"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Status Feedback Message */}
      <div
        className={`w-full py-2 px-4 rounded-2xl mb-3 text-xs sm:text-sm font-black shadow-sm transition-all border ${
          tossState === 'airborne'
            ? 'bg-amber-100 text-[#8A1538] border-amber-400 animate-pulse'
            : tossState === 'success_catch'
            ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
            : tossState === 'missed'
            ? 'bg-rose-100 text-rose-900 border-rose-300'
            : 'bg-white/85 text-[#513A2E] border-[#C7A15A]'
        }`}
      >
        {statusMessage}
      </div>

      {/* Main Interactive Play Area */}
      <div className="relative w-full max-w-md my-2 flex flex-col items-center">
        {/* Airborne Stone Stage (Upper Sky Zone) */}
        <div className="relative w-full h-28 flex items-center justify-center overflow-visible">
          {/* Flight Arc and Tossing Stone */}
          <div
            className={`transition-all duration-500 flex flex-col items-center ${
              tossState === 'airborne'
                ? '-translate-y-6 scale-125'
                : tossState === 'success_catch'
                ? 'translate-y-2 scale-110 animate-bounce'
                : 'translate-y-2 scale-100'
            }`}
          >
            {/* Pebble indicator badge */}
            <span
              className={`text-[11px] font-black px-2.5 py-0.5 rounded-full mb-1 border shadow transition ${
                tossState === 'airborne'
                  ? 'bg-amber-400 text-[#8A1538] border-amber-600 ring-2 ring-white animate-bounce'
                  : 'bg-black/60 text-amber-200 border-amber-400'
              }`}
            >
              {tossState === 'airborne' ? 'حصاة الطيرة في الهواء! ⏱️' : 'حصاة الطيرة (الرمي)'}
            </span>

            {/* The Tossing Pebble SVG */}
            <button
              onClick={handleToss}
              disabled={tossState === 'airborne' || gameFinished}
              className={`cursor-pointer transition transform active:scale-90 ${
                tossState === 'airborne' ? 'pointer-events-none' : 'hover:scale-105'
              }`}
              title="انقر لرمي الحصاة في الهواء"
            >
              {renderPebbleSVG('tossing', 48, false, tossState === 'airborne')}
            </button>

            {/* Timer Ring Bar when Airborne */}
            {tossState === 'airborne' && (
              <div className="w-32 bg-stone-300 h-2 rounded-full mt-2 overflow-hidden border border-stone-400">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 h-full transition-all duration-75"
                  style={{ width: `${airTimeRemaining}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Traditional Sand Ground Mat (نطع الصقلة الرملي) */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-b from-[#E7D6B9] via-[#DEC7A3] to-[#C9AD86] border-8 border-[#A67C52] shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Traditional Woven Rim / Stitching Pattern */}
          <div className="absolute inset-1.5 rounded-full border-2 border-dashed border-[#8E633C]/60 pointer-events-none" />
          <div className="absolute inset-4 rounded-full border border-[#8E633C]/30 pointer-events-none" />

          {/* Sand texture ripple */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_10%,transparent_60%)] pointer-events-none" />

          {/* Center Label for Ground Mat */}
          <div className="absolute top-3 text-[11px] font-black text-[#6B4E2B]/70 bg-white/40 px-3 py-0.5 rounded-full pointer-events-none">
            نطع الأرض (انقر لالتقاط الحصى)
          </div>

          {/* 4 Ground Pebbles */}
          {groundPebbles.map((pebble) => {
            const isSnatched = snatchedInFlight.includes(pebble.id);
            const isTarget = tossState === 'airborne' && !pebble.isCollected && !isSnatched;

            if (pebble.isCollected) {
              return (
                <div
                  key={pebble.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 opacity-25 pointer-events-none"
                  style={{ left: `${pebble.x}%`, top: `${pebble.y}%` }}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-stone-600 flex items-center justify-center text-[10px] font-bold text-stone-700">
                    ✓
                  </div>
                </div>
              );
            }

            return (
              <button
                key={pebble.id}
                onClick={() => handleSnatchPebble(pebble.id)}
                disabled={tossState !== 'airborne' || isSnatched}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 cursor-pointer ${
                  isSnatched
                    ? 'scale-125 opacity-90 -translate-y-8 animate-pulse'
                    : isTarget
                    ? 'hover:scale-115 animate-bounce ring-4 ring-amber-400 ring-offset-2 rounded-full'
                    : 'hover:scale-105'
                }`}
                style={{
                  left: `${pebble.x}%`,
                  top: `${pebble.y}%`,
                  transform: `translate(-50%, -50%) rotate(${pebble.rotation}deg)`,
                }}
                title={
                  tossState === 'airborne'
                    ? 'التقط هذه الحصاة بسرعة!'
                    : 'ارمِ حصاة الطيرة أولاً لتتمكن من الالتقاط'
                }
              >
                {renderPebbleSVG(pebble.colorType, pebble.size, isSnatched)}

                {/* Snatch Indicator Tag */}
                {isTarget && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-[#8A1538] text-[9px] font-black px-1.5 py-0.2 rounded-full shadow border border-amber-600 whitespace-nowrap">
                    التقط! 👆
                  </span>
                )}
                {isSnatched && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow">
                    تم ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hand / Basket Tray for Collected Pebbles */}
        <div className="mt-3 flex items-center gap-3 bg-[#FAF6EE] px-4 py-2 rounded-2xl border-2 border-[#C7A15A] shadow-md">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#513A2E]">
            <Hand className="w-4 h-4 text-[#8A1538]" />
            <span>الحصوات المجمعة في اليد:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((idx) => {
              const isGathered = idx <= collectedCount;
              return (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all ${
                    isGathered
                      ? 'bg-amber-400 border-[#8A1538] text-[#8A1538] shadow scale-105 font-black text-xs'
                      : 'bg-stone-200/70 border-stone-300 text-stone-400'
                  }`}
                >
                  {isGathered ? '🪨' : '○'}
                </div>
              );
            })}
          </div>

          <span className="text-xs font-black text-[#8A1538] mr-2">
            ({collectedCount} / 4)
          </span>
        </div>
      </div>

      {/* Main Game Control Buttons */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 w-full">
        {!gameFinished ? (
          <>
            <button
              onClick={handleToss}
              disabled={tossState === 'airborne'}
              className={`px-7 py-3.5 rounded-2xl font-black text-base shadow-xl border-2 transition active:scale-95 cursor-pointer flex items-center gap-2 ${
                tossState === 'airborne'
                  ? 'bg-amber-400 text-[#8A1538] border-amber-600 opacity-90'
                  : 'bg-[#8A1538] hover:bg-[#72112e] text-white border-[#C7A15A]'
              }`}
            >
              <ArrowUp className={`w-5 h-5 ${tossState === 'airborne' ? 'animate-bounce' : ''}`} />
              <span>
                {tossState === 'airborne'
                  ? 'الحصاة في الهواء... التقط الآن!'
                  : currentRound === 1
                  ? 'ارمِ الحصاة (الجولة 1: الواحد) 🪨'
                  : currentRound === 2
                  ? 'ارمِ الحصاة (الجولة 2: المثنى) 🪨'
                  : 'ارمِ الحصاة (الجولة 3: الجمع) 🪨'}
              </span>
            </button>

            {/* Quick-catch accessibility button during flight */}
            {tossState === 'airborne' && (
              <button
                onClick={handleQuickSnatch}
                className="px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#513A2E] font-black text-sm shadow-xl border-2 border-white animate-pulse active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#8A1538]" />
                <span>التقاط سريع خاطف! ⚡</span>
              </button>
            )}
          </>
        ) : (
          <div className="p-4 bg-emerald-100 text-emerald-900 rounded-2xl font-black border-2 border-emerald-400 shadow-md flex items-center gap-2 text-sm md:text-base">
            <Trophy className="w-5 h-5 text-amber-600 shrink-0" />
            <span>🎉 أحسنت صنعاً! أتممت لعبة الصقلة الشعبية بكل مراحلها وحزت وسام الفريج.</span>
          </div>
        )}
      </div>

      {/* Authentic Cultural Background Card */}
      <div className="mt-4 p-3 bg-amber-50/90 rounded-2xl border border-[#C7A15A]/60 text-right w-full text-xs text-[#513A2E] leading-relaxed shadow-sm">
        <span className="font-black text-[#8A1538] block mb-0.5">
          💡 معلومة تراثية عن لعبة الصقلة:
        </span>
        تُعد الصقلة من أقدم الألعاب الشعبية في الفرجان القطرية، وتُلعب بخمس حصوات ملساء تُجمع من السواحل أو البر. تُرمى حصاة واحدة (الطيرة) في الهواء، وخلال زمن طيرانها يلتقط اللاعب حصوات الأرض بخفة وسرعة يد فائقة قبل أن تسقط الحصاة أرضًا.
      </div>
    </div>
  );
};
