import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowLeft, Volume2, VolumeX, RotateCcw, Users } from 'lucide-react';
import { AbuRashidAvatar, VisitorAvatar } from './Characters';
import { HeritageLantern } from './HeritagePatterns';
import { audioEngine } from '../services/audioService';

interface GateScreenProps {
  onEnter: () => void;
}

export const GateScreen: React.FC<GateScreenProps> = ({ onEnter }) => {
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(audioEngine.getIsMuted());
  const [isGateHovered, setIsGateHovered] = useState<boolean>(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // عداد الرحالة الحاليين في القرية التراثية
  const [travelersCount, setTravelersCount] = useState<number>(() => {
    // رقم عشوائي يبدأ بين 165 و 385 لإضفاء طابع حيوي وتفاعلي
    return Math.floor(Math.random() * (385 - 165 + 1)) + 165;
  });

  useEffect(() => {
    // تحديث دوري خفيف يحاكي حركة الرحالة في القرية (+/- عدد بسيط كل بضع ثوانٍ)
    const interval = setInterval(() => {
      setTravelersCount(prev => {
        const delta = Math.floor(Math.random() * 5) - 2; // من -2 إلى +2
        const next = prev + delta;
        return next < 120 ? 135 : next > 480 ? 460 : next;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const welcomeMessage = 'مَرْحَبًا بِكُمْ فِي قَطَر لَوَّل. يَلَّا، نَفْتَحْ بَوَّابَةَ الزَّمَنِ، وَنَبْدَأْ رِحْلَتَنَا فِي تُرَاثِ قَطَر.';

  // إلغاء أي صوت ترحيبي عند مغادرة الشاشة
  useEffect(() => {
    return () => {
      audioEngine.stopWelcomeAbuRashid();
    };
  }, []);

  // تشغيل صوت أبو راشد العربي الرجالي عند الضغط على زر فقاعة الصوت أو عبارة "انقر للاستماع"
  const handleSpeakWelcome = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // متطلب: "عند الضغط مرة أخرى، أوقف الصوت الحالي ثم أعد تشغيله من البداية"
    if (isSpeaking) {
      audioEngine.stopWelcomeAbuRashid();
      setIsSpeaking(false);
      setTimeout(() => {
        setIsSpeaking(true);
        audioEngine.playWelcomeAbuRashid(
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }, 40);
      return;
    }

    setIsSpeaking(true);
    audioEngine.playWelcomeAbuRashid(
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleGateHoverStart = () => {
    if (isOpening) return;
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    setIsGateHovered(true);
    audioEngine.playGateVibration();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([18, 25, 18]);
      } catch {
        // ignore
      }
    }
  };

  const handleGateHoverEnd = () => {
    setIsGateHovered(false);
  };

  const handleGateTouchEnd = () => {
    // Keep vibration and glow active briefly after touching to provide satisfying tactile feedback
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
    touchTimerRef.current = setTimeout(() => {
      setIsGateHovered(false);
    }, 700);
  };

  const handleOpenGate = () => {
    if (isOpening) return;
    setIsGateHovered(false);
    setHasStarted(true);

    // 1. Initialize audio & play door open sound
    audioEngine.init();
    audioEngine.playDoorOpen();

    // 2. Animate door swinging open
    setIsOpening(true);

    // 3. Smooth transition after doors swing and golden fanfare jingle completes
    setTimeout(() => {
      onEnter();
    }, 2200);
  };

  const handleToggleSound = () => {
    const next = audioEngine.toggleMute();
    setIsMuted(next);
  };

  const handleTestSound = () => {
    audioEngine.init();
    audioEngine.testAudio();
  };

  return (
    <div className="bg-[#F7F1E5] w-full min-h-screen overflow-hidden flex flex-col justify-between items-center relative font-['Cairo',sans-serif] select-none" dir="rtl">
      {/* Background Plaster Ornament & Subtle Geometric Glow */}
      <div className="absolute inset-4 md:inset-8 border-[10px] md:border-[12px] border-[#D8C29D] opacity-40 plaster-border rounded-2xl pointer-events-none z-0" />
      <div className="absolute inset-0 pointer-events-none opacity-25 geometric-glow z-0" />

      {/* Top Navigation Rail matching Geometric Balance theme */}
      <nav className="w-full h-16 bg-[#8A1538] flex items-center justify-between px-4 md:px-8 z-50 border-b-4 border-[#C7A15A] shadow-lg">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="bg-[#C7A15A] text-[#8A1538] px-4 md:px-6 py-1.5 rounded-full font-black shadow-inner flex items-center gap-2 border border-[#F7F1E5] text-xs md:text-sm">
            <span className="text-base md:text-lg">📖</span>
            <span>جواز قطر لوّل</span>
          </div>
          <div className="text-white flex gap-2 text-xs md:text-sm">
            <button
              onClick={handleToggleSound}
              className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-1.5 transition active:scale-95"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-300" />}
              <span>{isMuted ? 'تشغيل الصوت' : 'الصوت يعمل'}</span>
            </button>
          </div>
        </div>

        <div className="text-white font-black text-xl md:text-2xl tracking-widest drop-shadow-md">
          قـطـر لـوّل
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleTestSound}
            className="bg-[#513A2E] hover:bg-[#3e2b21] text-white px-3 md:px-4 py-1.5 rounded-lg border border-[#C7A15A] text-xs font-bold transition shadow active:scale-95"
          >
            اختبار الصوت
          </button>
        </div>
      </nav>

      {/* Main Cinematic Frame with Symmetrical Geometric Balance */}
      <div className="relative flex-1 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between px-4 md:px-8 py-4 z-10 my-auto">
        {/* Symmetrical Floating Lanterns */}
        <div className="absolute top-4 right-12 hidden lg:block animate-pulse pointer-events-none">
          <HeritageLantern size={48} />
        </div>
        <div className="absolute top-8 left-12 hidden lg:block animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}>
          <HeritageLantern size={44} />
        </div>

        {/* Right Character: Abu Rashid with Arched Pedestal & Sadu Inlay (in RTL: Right) */}
        <div
          onClick={handleSpeakWelcome}
          className="hidden lg:flex flex-col items-center gap-3 order-1 cursor-pointer group transition-transform duration-300 hover:scale-[1.03] active:scale-95"
          title="اضغط للاستماع لصوت أبو راشد"
        >
          <div className="w-44 h-72 bg-[#D8C29D] rounded-t-full border-4 border-[#C7A15A] group-hover:border-[#8A1538] relative shadow-2xl overflow-hidden flex flex-col items-center justify-end p-2 transition-colors">
            <div className="absolute top-0 inset-x-0 h-full sadu-pattern opacity-15 pointer-events-none" />
            <div className="relative z-10">
              <AbuRashidAvatar size={135} isTalking={isSpeaking || hasStarted} showName={false} />
            </div>
            {/* Quick voice hint tag on hover */}
            <div className="absolute top-3 inset-x-0 mx-auto w-fit bg-[#8A1538]/90 text-amber-200 text-[11px] font-bold px-3 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-none flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              <span>استمع لصوت أبو راشد</span>
            </div>
          </div>
          <div className="bg-[#513A2E] group-hover:bg-[#8A1538] text-[#F7F1E5] px-6 py-1.5 rounded-full text-base font-black border-2 border-[#C7A15A] shadow-lg transition-colors flex items-center gap-2">
            <span>أبو راشد</span>
            <Volume2 className="w-4 h-4 text-amber-300" />
          </div>
        </div>

        {/* Center: The Gate, Door Leaves, and CTA */}
        <div className="w-full max-w-[520px] flex flex-col items-center justify-center order-2 my-auto">
          <div className="text-center mb-3 flex flex-col items-center">
            {/* عداد الرحالة الحاليين في القرية التراثية */}
            <div
              id="travelers-live-counter"
              className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full border-2 border-[#C7A15A] shadow-md mb-2 transition-all hover:shadow-lg"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <Users className="w-4 h-4 text-[#8A1538]" />
              <span className="text-xs md:text-sm font-bold text-[#513A2E]">عدد الرحالة الحاليين:</span>
              <span className="bg-[#8A1538] text-amber-200 font-black px-2.5 py-0.5 rounded-full text-xs md:text-sm shadow-inner tracking-wider">
                {travelersCount} رحّال
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-[#8A1538] mb-2 drop-shadow-md tracking-tight font-['Cairo']">
              بوابة قطر لوّل
            </h1>
            <p className="text-base md:text-xl text-[#513A2E] font-bold">
              رحلة تفاعلية لاكتشاف تراث قطر
            </p>
          </div>

          {/* The Giant Wooden Doors - Interactive Time Gate (تهتز وتتوهج عند التمرير أو اللمس) */}
          <div
            id="time-gate-portal"
            role="button"
            tabIndex={0}
            aria-label="بوابة الزمن - انقر أو المس للعبور إلى قطر لوّل"
            onClick={handleOpenGate}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenGate();
              }
            }}
            onMouseEnter={handleGateHoverStart}
            onMouseLeave={handleGateHoverEnd}
            onTouchStart={handleGateHoverStart}
            onTouchEnd={handleGateTouchEnd}
            className={`w-full max-w-[420px] h-[270px] md:h-[310px] relative perspective-[1200px] mb-4 cursor-pointer select-none group transition-transform duration-300 ${
              isGateHovered && !isOpening ? 'scale-[1.03]' : ''
            }`}
          >
            {/* Encouraging Callout Badge on Hover/Touch */}
            <div
              className={`absolute -top-7 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap px-4 py-1 rounded-full text-xs font-black transition-all duration-300 flex items-center gap-1.5 shadow-lg pointer-events-none ${
                isGateHovered && !isOpening
                  ? 'bg-[#8A1538] text-amber-200 border-2 border-amber-300 scale-105 shadow-amber-500/50'
                  : 'bg-white/95 text-[#513A2E] border border-[#C7A15A] opacity-90'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGateHovered && !isOpening ? 'text-amber-300 animate-spin' : 'text-[#8A1538]'}`} />
              <span>{isGateHovered && !isOpening ? 'بوابة الزمن تهتز وتتوهج! انقر للعبور ⚡' : 'مرّر الفأرة أو المس البوابة لاكتشاف سرّها ✨'}</span>
            </div>

            {/* Glowing Golden Aura / Portal energy field (تتوهج البوابة) */}
            <div
              className={`absolute -inset-3 md:-inset-5 rounded-t-3xl pointer-events-none transition-all duration-500 ${
                isGateHovered && !isOpening
                  ? 'opacity-100 animate-gate-aura bg-gradient-to-t from-amber-500/50 via-yellow-400/50 to-amber-200/60'
                  : 'opacity-20 bg-gradient-to-t from-amber-400/20 via-yellow-300/10 to-transparent blur-sm'
              }`}
            />

            {/* Floating mystical sparks on hover */}
            {isGateHovered && !isOpening && (
              <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
                <span className="absolute -top-2 left-6 text-amber-300 text-sm animate-ping">✦</span>
                <span className="absolute -top-3 right-8 text-yellow-300 text-xs animate-pulse">✨</span>
                <span className="absolute top-1/3 -left-3 text-amber-400 text-sm animate-bounce">✧</span>
                <span className="absolute top-1/2 -right-3 text-yellow-200 text-base animate-pulse">✦</span>
                <span className="absolute bottom-6 left-12 text-amber-300 text-xs animate-ping">✨</span>
                <span className="absolute bottom-8 right-10 text-yellow-400 text-sm animate-bounce">✧</span>
              </div>
            )}

            {/* Vibration Wrapper: (تهتز البوابة عند التمرير أو اللمس) */}
            <div
              className={`w-full h-full flex gap-1 relative ${
                isGateHovered && !isOpening ? 'animate-gate-vibrate' : ''
              }`}
            >
              {/* Door Arch Shadow / Golden Arch Highlight */}
              <div
                className={`absolute -top-5 left-0 w-full h-8 rounded-t-full transition-all duration-300 ${
                  isGateHovered && !isOpening
                    ? 'bg-amber-400 opacity-80 blur-xs shadow-[0_0_20px_#F59E0B]'
                    : 'bg-[#C7A15A] opacity-35 blur-sm'
                }`}
              />

              {/* Glowing Golden Time Beam leaking between the two doors */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-1 bottom-1 w-2 rounded-full z-15 pointer-events-none transition-all duration-300 ${
                  isGateHovered && !isOpening
                    ? 'bg-gradient-to-b from-yellow-100 via-amber-300 to-white opacity-100 animate-center-beam'
                    : 'bg-amber-400/20 opacity-0'
                }`}
              />

              {/* Golden Light Burst behind doors (when opening) */}
              <div
                className={`absolute inset-0 rounded-t-3xl bg-gradient-to-t from-amber-400 via-yellow-200 to-white flex items-center justify-center transition-all duration-1000 ${
                  isOpening ? 'opacity-100 scale-105 shadow-2xl shadow-yellow-300' : 'opacity-0 scale-95'
                }`}
              >
                <div className="text-center p-3">
                  <Sparkles className="w-14 h-14 text-[#8A1538] animate-spin mx-auto mb-1" />
                  <span className="text-[#8A1538] font-black text-lg">مرحبًا بكم في قطر لوّل!</span>
                </div>
              </div>

              {/* Right Door Leaf (in RTL: Right) */}
              <div
                className={`flex-1 wood-grain rounded-tr-3xl rounded-br-lg border-r-8 border-t-8 border-b-8 shadow-xl relative transition-all duration-1000 ease-out origin-right flex flex-col justify-between p-4 ${
                  isOpening ? 'rotate-y-110 translate-x-4 opacity-20' : 'rotate-y-0'
                } ${
                  isGateHovered && !isOpening
                    ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)]'
                    : 'border-[#C7A15A]'
                }`}
              >
                {/* Ring Knocker */}
                <div
                  className={`absolute top-1/2 left-3 w-9 h-9 bg-[#C7A15A] rounded-full border-2 border-[#8A1538] flex items-center justify-center shadow-md transition-all ${
                    isGateHovered && !isOpening
                      ? 'animate-ring-clink shadow-[0_0_12px_#F59E0B] border-amber-300'
                      : ''
                  }`}
                >
                  <div className="w-2 h-3 bg-[#513A2E] rounded-sm" />
                </div>
                {/* Geometric Brass Studs */}
                <div className="grid grid-cols-2 gap-6 p-4 opacity-50">
                  <div className={`w-3.5 h-3.5 rounded-full shadow transition-all ${isGateHovered && !isOpening ? 'bg-amber-300 shadow-[0_0_8px_#F59E0B] scale-110' : 'bg-[#C7A15A]'}`} />
                  <div className={`w-3.5 h-3.5 rounded-full shadow transition-all ${isGateHovered && !isOpening ? 'bg-amber-300 shadow-[0_0_8px_#F59E0B] scale-110' : 'bg-[#C7A15A]'}`} />
                  <div className={`w-3.5 h-3.5 rounded-full shadow transition-all ${isGateHovered && !isOpening ? 'bg-amber-300 shadow-[0_0_8px_#F59E0B] scale-110' : 'bg-[#C7A15A]'}`} />
                  <div className={`w-3.5 h-3.5 rounded-full shadow transition-all ${isGateHovered && !isOpening ? 'bg-amber-300 shadow-[0_0_8px_#F59E0B] scale-110' : 'bg-[#C7A15A]'}`} />
                </div>
              </div>

              {/* Left Door Leaf */}
              <div
                className={`flex-1 wood-grain rounded-tl-3xl rounded-bl-lg border-l-8 border-t-8 border-b-8 shadow-xl relative transition-all duration-1000 ease-out origin-left flex flex-col justify-between p-4 ${
                  isOpening ? '-rotate-y-110 -translate-x-4 opacity-20' : 'rotate-y-0'
                } ${
                  isGateHovered && !isOpening
                    ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)]'
                    : 'border-[#C7A15A]'
                }`}
              >
                {/* Ring Knocker */}
                <div
                  className={`absolute top-1/2 right-3 w-9 h-9 bg-[#C7A15A] rounded-full border-2 border-[#8A1538] flex items-center justify-center shadow-md transition-all ${
                    isGateHovered && !isOpening
                      ? 'animate-ring-clink shadow-[0_0_12px_#F59E0B] border-amber-300'
                      : ''
                  }`}
                >
                  <div className="w-2 h-3 bg-[#513A2E] rounded-sm" />
                </div>
                {/* Geometric Brass Studs */}
                <div className="grid grid-cols-2 gap-6 p-4 opacity-50">
                  <div className={`w-3.5 h-3.5 rounded-full shadow transition-all ${isGateHovered && !isOpening ? 'bg-amber-300 shadow-[0_0_8px_#F59E0B] scale-110' : 'bg-[#C7A15A]'}`} />
                  <div className={`w-3.5 h-3.5 rounded-full shadow transition-all ${isGateHovered && !isOpening ? 'bg-amber-300 shadow-[0_0_8px_#F59E0B] scale-110' : 'bg-[#C7A15A]'}`} />
                  <div className={`w-3.5 h-3.5 rounded-full shadow transition-all ${isGateHovered && !isOpening ? 'bg-amber-300 shadow-[0_0_8px_#F59E0B] scale-110' : 'bg-[#C7A15A]'}`} />
                  <div className={`w-3.5 h-3.5 rounded-full shadow transition-all ${isGateHovered && !isOpening ? 'bg-amber-300 shadow-[0_0_8px_#F59E0B] scale-110' : 'bg-[#C7A15A]'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Main Geometric Balance CTA Button */}
          <button
            onClick={handleOpenGate}
            disabled={isOpening}
            className={`mt-2 bg-[#8A1538] hover:bg-[#72112e] text-white px-10 md:px-14 py-4 md:py-5 rounded-2xl text-xl md:text-2xl font-black border-b-8 border-[#513A2E] active:border-b-0 active:translate-y-1 transition-all flex items-center gap-4 group shadow-2xl cursor-pointer ${
              isGateHovered && !isOpening ? 'ring-4 ring-amber-400 shadow-amber-500/50 scale-[1.02]' : ''
            }`}
          >
            <span>{isOpening ? 'جارٍ فتح البوابة...' : 'افتح بوابة الزمن'}</span>
            <ArrowLeft className={`w-6 h-6 transition-transform text-amber-300 ${isGateHovered && !isOpening ? '-translate-x-2 animate-pulse' : 'group-hover:-translate-x-2'}`} />
          </button>
        </div>

        {/* Left Character: Visitor with Arched Pedestal (in RTL: Left) */}
        <div className="hidden lg:flex flex-col items-center gap-3 order-3">
          <div className="w-40 h-68 bg-white/70 rounded-t-full border-4 border-[#D8C29D] relative shadow-xl backdrop-blur-sm overflow-hidden flex flex-col items-center justify-end p-2">
            <div className="relative z-10">
              <VisitorAvatar size={125} showName={false} />
            </div>
          </div>
          <div className="bg-[#C7A15A] text-[#513A2E] px-6 py-1.5 rounded-full text-base font-black border-2 border-[#8A1538] shadow-lg">
            الزائر
          </div>
        </div>
      </div>

      {/* Central Dialogue Bubble from Design */}
      <div className="w-full max-w-2xl px-4 z-20 mb-3">
        <div className={`bg-white p-4 md:p-5 rounded-3xl border-4 transition-all duration-300 shadow-xl flex gap-3 md:gap-4 items-start text-right ${
          isSpeaking ? 'border-[#8A1538] ring-4 ring-[#C7A15A]/30 shadow-2xl' : 'border-[#C7A15A]'
        }`}>
          {/* زر فقاعة الصوت بجانب عبارة «أبو راشد يقول» */}
          <button
            id="voice-bubble-button"
            onClick={handleSpeakWelcome}
            title={isSpeaking ? 'جارٍ النطق... انقر لإعادة التشغيل من البداية' : 'اضغط للاستماع لصوت أبو راشد'}
            aria-label={isSpeaking ? 'إعادة نطق ترحيب أبو راشد' : 'الاستماع لصوت أبو راشد'}
            className={`shrink-0 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center outline-none select-none active:scale-95 ${
              isSpeaking
                ? 'w-16 h-16 md:w-18 md:h-18 rounded-full bg-[#8A1538] text-white border-4 border-[#C7A15A] shadow-xl ring-4 ring-amber-400/50 scale-105'
                : 'w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#D8C29D]/30 hover:bg-[#D8C29D]/60 text-[#8A1538] border-2 border-[#C7A15A] hover:border-[#8A1538] shadow-sm'
            }`}
          >
            {isSpeaking ? (
              <div className="flex flex-col items-center justify-center">
                <Volume2 className="w-6 h-6 text-amber-300 animate-bounce" />
                <span className="text-[10px] font-black text-amber-200 tracking-tighter">إعادة</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="text-2xl leading-none">💬</span>
                <span className="text-[9px] font-bold text-[#8A1538] mt-0.5 flex items-center gap-0.5">
                  <Volume2 className="w-2.5 h-2.5 text-[#C7A15A]" />
                  <span>استمع</span>
                </span>
              </div>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="text-[#8A1538] font-black text-sm md:text-base">
                أبو راشد يقول:
              </h4>

              <button
                id="voice-bubble-text-btn"
                onClick={handleSpeakWelcome}
                title={isSpeaking ? 'انقر لإعادة الصوت من البداية' : 'انقر للاستماع لصوت أبو راشد (صوت رجل تراثي أصيل)'}
                className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95 ${
                  isSpeaking
                    ? 'bg-[#8A1538] text-white border border-[#C7A15A] ring-2 ring-amber-300/50'
                    : 'bg-[#F7F1E5] hover:bg-amber-100 text-[#8A1538] border border-[#C7A15A]'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>أبو راشد يتحدث... (انقر للإعادة)</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#8A1538]" />
                    <span>انقر للاستماع 🔊</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[#513A2E] text-sm md:text-lg font-bold leading-relaxed">
              {welcomeMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar from Design HTML */}
      <footer className="w-full h-12 bg-[#F7F1E5] border-t-2 border-[#D8C29D] px-4 md:px-8 flex items-center justify-between text-xs md:text-sm text-[#513A2E] font-bold z-20">
        <div className="flex items-center gap-4 md:gap-6">
          <span className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>الصوت يعمل</span>
          </span>
          <button
            onClick={handleTestSound}
            className="underline text-[#8A1538] hover:text-[#513A2E] transition hidden sm:inline"
          >
            اختبار الصوت
          </button>
        </div>
        <div className="flex items-center gap-3 md:gap-6 text-[11px] md:text-xs">
          <span className="hidden sm:flex items-center gap-1.5 text-[#8A1538] font-black bg-white/70 px-2.5 py-1 rounded-full border border-[#D8C29D]">
            <Users className="w-3.5 h-3.5 text-[#8A1538]" />
            <span>الرحالة في القرية: {travelersCount}</span>
          </span>
          <span>📍 الموقع: بوابة قطر لوّل</span>
          <span className="hidden sm:inline">🕒 المدة المقدرة: 15 دقيقة</span>
        </div>
      </footer>
    </div>
  );
};
