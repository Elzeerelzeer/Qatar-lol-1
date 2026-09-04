import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StationId } from './types';
import { audioEngine } from './services/audioService';
import { TopBar } from './components/TopBar';
import { GateScreen } from './components/GateScreen';
import { VillageMap } from './components/VillageMap';
import { SouqStation } from './components/SouqStation';
import { PearlSeaStation } from './components/PearlSeaStation';
import { NokhathaStation } from './components/NokhathaStation';
import { MajlisStation } from './components/MajlisStation';
import { FereejStation } from './components/FereejStation';
import { StudioStation } from './components/StudioStation';
import { TreasureScreen } from './components/TreasureScreen';
import { PassportModal } from './components/PassportModal';
import { Dallah3DModal } from './components/Dallah3DModal';
import { AlertCircle, Clock } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    'gate' | 'village' | 'souq' | 'sea' | 'nokhatha' | 'majlis' | 'fereej' | 'studio' | 'treasure'
  >('gate');

  const [completedStations, setCompletedStations] = useState<StationId[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [isDallah3DOpen, setIsDallah3DOpen] = useState<boolean>(false);
  const [showEndVisitConfirm, setShowEndVisitConfirm] = useState<boolean>(false);

  // Idle timeout (120s idle -> 20s countdown -> auto reset)
  const [idleWarningVisible, setIdleWarningVisible] = useState<boolean>(false);
  const [idleCountdown, setIdleCountdown] = useState<number>(20);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- FULL RESET FUNCTION (إنهاء الزيارة) ---
  const handleFullReset = useCallback(() => {
    // 1. Stop audio & narration
    audioEngine.stopAll();
    audioEngine.setZone('none');

    // 2. Clear state & stamps
    setCompletedStations([]);
    setIsPassportOpen(false);
    setShowEndVisitConfirm(false);
    setIdleWarningVisible(false);

    // 3. Clear timers
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // 4. Return to Entry Gate
    setCurrentScreen('gate');
  }, []);

  // --- IDLE TIMEOUT TRACKER ---
  const resetIdleTimer = useCallback(() => {
    // If warning was showing, cancel it
    if (idleWarningVisible) {
      setIdleWarningVisible(false);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    // Only monitor idle activity if beyond the gate screen
    if (currentScreen !== 'gate') {
      idleTimerRef.current = setTimeout(() => {
        // 120 seconds passed without interaction
        setIdleWarningVisible(true);
        setIdleCountdown(20);

        countdownIntervalRef.current = setInterval(() => {
          setIdleCountdown((prev) => {
            if (prev <= 1) {
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              handleFullReset();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 120000); // 120,000 ms = 2 minutes
    }
  }, [currentScreen, idleWarningVisible, handleFullReset]);

  useEffect(() => {
    const handleUserActivity = () => {
      resetIdleTimer();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('mousedown', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [resetIdleTimer]);

  // Heritage Background Music management based on active screen
  useEffect(() => {
    if (currentScreen !== 'gate') {
      audioEngine.startHeritageBGM();
    } else {
      audioEngine.stopHeritageBGM();
    }
  }, [currentScreen]);

  // Audio Toggles
  const handleToggleSound = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    audioEngine.toggleAudio(next);
  };

  const handleToggleVoice = () => {
    const next = !isVoiceMuted;
    setIsVoiceMuted(next);
    audioEngine.toggleVoice(next);
  };

  // Station Completion Handler
  const handleCompleteStation = (stationId: StationId) => {
    setCompletedStations((prev) => {
      if (prev.includes(stationId)) return prev;
      return [...prev, stationId];
    });
    // Return to Village Map
    setCurrentScreen('village');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F7F1E5] text-[#513A2E] font-['Cairo'] flex flex-col antialiased select-none">
      {/* Top Global Navigation (Visible in Village & All Stations) */}
      {currentScreen !== 'gate' && (
        <TopBar
          isMuted={isAudioMuted}
          onToggleSound={handleToggleSound}
          isVoiceMuted={isVoiceMuted}
          onToggleVoice={handleToggleVoice}
          onOpenPassport={() => setIsPassportOpen(true)}
          onOpenDallah3D={() => setIsDallah3DOpen(true)}
          onEndVisit={() => setShowEndVisitConfirm(true)}
          completedCount={completedStations.length}
        />
      )}

      {/* Main View Switcher */}
      <main className="flex-1 flex flex-col">
        {currentScreen === 'gate' && (
          <GateScreen onEnter={() => setCurrentScreen('village')} />
        )}

        {currentScreen === 'village' && (
          <VillageMap
            completedStations={completedStations}
            onSelectStation={(id) => setCurrentScreen(id as any)}
            onOpenPassport={() => setIsPassportOpen(true)}
          />
        )}

        {currentScreen === 'souq' && (
          <SouqStation
            onComplete={() => handleCompleteStation('souq')}
            onBackToVillage={() => setCurrentScreen('village')}
          />
        )}

        {currentScreen === 'sea' && (
          <PearlSeaStation
            onComplete={() => handleCompleteStation('sea')}
            onBackToVillage={() => setCurrentScreen('village')}
          />
        )}

        {currentScreen === 'nokhatha' && (
          <NokhathaStation
            onComplete={() => handleCompleteStation('nokhatha')}
            onBackToVillage={() => setCurrentScreen('village')}
          />
        )}

        {currentScreen === 'majlis' && (
          <MajlisStation
            onComplete={() => handleCompleteStation('majlis')}
            onBackToVillage={() => setCurrentScreen('village')}
          />
        )}

        {currentScreen === 'fereej' && (
          <FereejStation
            onComplete={() => handleCompleteStation('fereej')}
            onBackToVillage={() => setCurrentScreen('village')}
          />
        )}

        {currentScreen === 'studio' && (
          <StudioStation
            onComplete={() => handleCompleteStation('studio')}
            onBackToVillage={() => setCurrentScreen('village')}
          />
        )}

        {currentScreen === 'treasure' && (
          <TreasureScreen onBackToVillage={() => setCurrentScreen('village')} />
        )}
      </main>

      {/* Passport Modal (جواز قطر لوّل) */}
      <PassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        completedStationIds={completedStations}
        onGoToNextStation={(nextId) => {
          setIsPassportOpen(false);
          setCurrentScreen(nextId as any);
        }}
      />

      {/* Global 3D Dallah Modal */}
      <Dallah3DModal
        isOpen={isDallah3DOpen}
        onClose={() => setIsDallah3DOpen(false)}
      />

      {/* End Visit Confirmation Dialog (إنهاء الزيارة وإعادة التعيين) */}
      {showEndVisitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#F7F1E5] rounded-3xl border-4 border-[#8A1538] p-6 text-[#513A2E] text-center shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#8A1538] text-amber-300 mx-auto flex items-center justify-center mb-3 shadow">
              <AlertCircle className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-black text-[#8A1538] mb-2 font-['Cairo']">
              إنهاء الزيارة؟
            </h3>

            <p className="text-sm font-bold leading-relaxed mb-6 bg-amber-100/70 p-4 rounded-2xl border border-[#C7A15A]/60 text-right">
              هل تريد إنهاء زيارتك والعودة إلى البوابة الرئيسية؟
              <br />
              سيتم إعادة تعيين الجلسة بالكامل وإيقاف الكاميرا والأصوات وتصفير الأختام.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleFullReset}
                className="flex-1 py-3.5 rounded-2xl bg-[#8A1538] text-white font-black text-base shadow-lg hover:bg-[#6b102b] active:scale-95"
              >
                نعم، إنهاء الزيارة
              </button>
              <button
                onClick={() => setShowEndVisitConfirm(false)}
                className="py-3.5 px-6 rounded-2xl bg-stone-300 text-stone-800 font-black text-base hover:bg-stone-400 active:scale-95"
              >
                متابعة التجربة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Idle Warning Notification Modal (تنبيه الخمول) */}
      {idleWarningVisible && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#F7F1E5] rounded-3xl border-4 border-amber-500 p-6 text-[#513A2E] text-center shadow-2xl animate-bounce">
            <div className="w-16 h-16 rounded-full bg-amber-500 text-white mx-auto flex items-center justify-center mb-3 shadow">
              <Clock className="w-8 h-8 animate-spin" />
            </div>

            <h3 className="text-2xl font-black text-[#8A1538] mb-1 font-['Cairo']">
              هل ما زلت معنا؟
            </h3>

            <p className="text-sm font-bold mb-4">
              ستنتهي الجلسة وتعود للبوابة خلال:
            </p>

            <div className="text-4xl font-black text-[#8A1538] mb-5">
              {idleCountdown} ثانية
            </div>

            <button
              onClick={resetIdleTimer}
              className="w-full py-3.5 rounded-2xl bg-[#8A1538] text-white font-black text-base shadow-lg border-2 border-[#C7A15A] hover:bg-[#6b102b] active:scale-95"
            >
              نعم، أنا هنا! متابعة الزيارة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
