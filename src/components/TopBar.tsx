import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, BookOpen, RotateCcw, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { audioEngine } from '../services/audioService';
import { SoundStatus } from '../types';

interface TopBarProps {
  onOpenPassport: () => void;
  onEndVisit: () => void;
  onOpenDallah3D?: () => void;
  isMuted?: boolean;
  onToggleSound?: () => void;
  isVoiceMuted?: boolean;
  onToggleVoice?: () => void;
  completedCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenPassport,
  onEndVisit,
  onOpenDallah3D,
  isMuted: propIsMuted,
  onToggleSound,
  isVoiceMuted,
  onToggleVoice,
  completedCount
}) => {
  const [localMuted, setLocalMuted] = useState<boolean>(audioEngine.getIsMuted());
  const [soundStatus, setSoundStatus] = useState<SoundStatus>(audioEngine.getStatus());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const unsub = audioEngine.subscribeStatus((status) => {
      setSoundStatus(status);
      setLocalMuted(audioEngine.getIsMuted());
    });
    return unsub;
  }, []);

  const isMuted = propIsMuted !== undefined ? propIsMuted : localMuted;

  const handleToggleMute = () => {
    if (onToggleSound) {
      onToggleSound();
    } else {
      const nextMuted = audioEngine.toggleMute();
      setLocalMuted(nextMuted);
    }
  };

  const handleTestAudio = () => {
    audioEngine.testAudio();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <nav className="w-full h-16 bg-[#8A1538] flex items-center justify-between px-3 md:px-8 z-50 border-b-4 border-[#C7A15A] shadow-lg sticky top-0 select-none">
      {/* Right Side (in RTL): Passport & Status */}
      <div className="flex items-center gap-2 md:gap-5">
        <button
          onClick={onOpenPassport}
          className="bg-[#C7A15A] hover:bg-[#d4b067] text-[#8A1538] px-3 md:px-5 py-2 rounded-full font-black shadow-inner flex items-center gap-2 border-2 border-[#F7F1E5] text-xs md:text-sm active:scale-95 transition-all cursor-pointer"
        >
          <span className="text-base md:text-lg">📖</span>
          <span>جواز قطر لوّل</span>
          {completedCount !== undefined && (
            <span className="bg-[#8A1538] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              {completedCount}/5
            </span>
          )}
        </button>

        {onOpenDallah3D && (
          <button
            onClick={onOpenDallah3D}
            className="bg-amber-100 hover:bg-amber-200 text-[#8A1538] px-2.5 md:px-3.5 py-1.5 rounded-full font-black shadow flex items-center gap-1.5 border border-amber-300 text-xs active:scale-95 transition-all cursor-pointer"
            title="عرض مجسم الدلة القطرية 3D"
          >
            <span className="text-base">🫖</span>
            <span className="hidden sm:inline">الدلّة 3D</span>
          </button>
        )}

        {/* Audio Quick Toggles */}
        <div className="flex items-center gap-1 md:gap-2 text-white text-xs font-bold">
          <button
            id="topbar-mute-toggle"
            onClick={handleToggleMute}
            className={`px-2.5 md:px-3.5 py-1.5 rounded-lg border transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isMuted
                ? 'bg-rose-950/60 hover:bg-rose-900/70 border-rose-400/50 text-rose-200'
                : 'bg-black/25 hover:bg-black/40 border-[#C7A15A]/60 text-amber-200'
            }`}
            title={isMuted ? 'تشغيل الموسيقى التراثية والصوت' : 'كتم الموسيقى التراثية والصوت'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-300" />
                <span className="text-[11px] md:text-xs">الموسيقى مكتومة</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[11px] md:text-xs flex items-center gap-1.5">
                  <span>موسيقى تراثية</span>
                  <span className="flex items-end gap-0.5 h-3 pb-0.5">
                    <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                    <span className="w-0.5 h-3 bg-amber-300 rounded-full animate-pulse [animation-delay:150ms]"></span>
                    <span className="w-0.5 h-1.5 bg-amber-400 rounded-full animate-pulse [animation-delay:300ms]"></span>
                  </span>
                </span>
              </>
            )}
          </button>

          <button
            id="topbar-fullscreen-toggle"
            onClick={toggleFullscreen}
            className="bg-white/10 hover:bg-white/20 px-2.5 md:px-3 py-1.5 rounded-lg border border-white/20 hidden md:flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'تصغير' : 'ملء الشاشة'}</span>
          </button>
        </div>
      </div>

      {/* Center: Brand Title with Geometric Balance Tracking */}
      <div className="text-white font-black text-xl md:text-2xl tracking-widest drop-shadow-md font-['Cairo']">
        قـطـر لـوّل
      </div>

      {/* Left Side (in RTL): Sound Testing & End Visit */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleTestAudio}
          className="bg-white/10 hover:bg-white/20 text-white px-2.5 md:px-3 py-1.5 rounded-lg border border-white/20 text-xs font-bold transition hidden sm:flex items-center gap-1 active:scale-95"
          title="اختبار الصوت ومكبرات الصوت"
        >
          <span>اختبار الصوت</span>
        </button>

        <button
          onClick={onEndVisit}
          className="bg-[#513A2E] hover:bg-[#3e2b21] text-white px-3 md:px-4 py-2 rounded-lg border border-[#C7A15A] text-xs md:text-sm font-bold shadow transition active:scale-95 flex items-center gap-1 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>إنهاء الزيارة</span>
        </button>
      </div>
    </nav>
  );
};
