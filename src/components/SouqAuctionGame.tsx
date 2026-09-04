import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  HelpCircle,
  Award,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Coins,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Wand2,
  Lock,
  Unlock,
  Check
} from 'lucide-react';
import { audioEngine } from '../services/audioService';
import { AbuRashidAvatar } from './Characters';
import { AuctionArtifactVisual } from './AuctionArtifactVisual';
import { DustScratchCanvas } from './DustScratchCanvas';
import { SecretShopModal } from './SecretShopModal';
import {
  AUCTION_TOOLS,
  HERITAGE_DESTINATIONS,
  AuctionToolItem,
  DestinationId
} from '../data/auctionTools';

interface SouqAuctionGameProps {
  onCompleteStation: () => void;
  onOpenDallah3D: () => void;
}

const STORAGE_KEY_COMPLETED = 'lawwal_auction_completed_ids_v2';
const STORAGE_KEY_COINS = 'lawwal_auction_coins_v2';

export const SouqAuctionGame: React.FC<SouqAuctionGameProps> = ({
  onCompleteStation,
  onOpenDallah3D
}) => {
  // Persistence state
  const [completedToolIds, setCompletedToolIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLETED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lawwalCoins, setLawwalCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COINS);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  // Current round state
  const [currentToolIndex, setCurrentToolIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<'inspecting' | 'solved' | 'placed'>('inspecting');
  const [cleanedPercent, setCleanedPercent] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [showRiddleModal, setShowRiddleModal] = useState<boolean>(false);
  const [activeClueAnswer, setActiveClueAnswer] = useState<{ title: string; text: string } | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isChestOpening, setIsChestOpening] = useState<boolean>(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState<boolean>(false);
  const [floatingCoin, setFloatingCoin] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSecretShopOpen, setIsSecretShopOpen] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Pick candidate tools
  const currentTool: AuctionToolItem = useMemo(() => {
    // If some tools are already completed, pick the first uncompleted one or loop
    const uncompleted = AUCTION_TOOLS.filter((t) => !completedToolIds.includes(t.id));
    if (uncompleted.length > 0) {
      // Find within list
      const idx = currentToolIndex % uncompleted.length;
      return uncompleted[idx];
    }
    // All completed - allow reviewing or playing from list
    return AUCTION_TOOLS[currentToolIndex % AUCTION_TOOLS.length];
  }, [completedToolIds, currentToolIndex]);

  // Generate 3 choices (1 correct, 2 random distractors)
  const choices = useMemo(() => {
    const distractors = AUCTION_TOOLS.filter((t) => t.id !== currentTool.id);
    // Deterministic or pseudo-random shuffle
    const shuffledDistractors = [...distractors].sort(() => 0.5 - Math.random());
    const selectedDistractors = shuffledDistractors.slice(0, 2);
    const combined = [currentTool, ...selectedDistractors];
    return combined.sort(() => 0.5 - Math.random());
  }, [currentTool]);

  // Play sound specific to the tool
  const playCurrentToolSound = useCallback(() => {
    setIsSoundPlaying(true);
    switch (currentTool.visualKey) {
      case 'dallah':
        audioEngine.playCoffeePour();
        break;
      case 'sadu':
        audioEngine.playSaduLoomSound();
        break;
      case 'mabkhara':
        audioEngine.playMabkharaSound();
        break;
      case 'pottery':
        audioEngine.playPotterySound();
        break;
      case 'diving':
        audioEngine.playDivingToolsSound();
        break;
      case 'mandoos':
        audioEngine.playMandoosSound();
        break;
      case 'raha':
        audioEngine.playRahaSound();
        break;
      case 'mizaan':
        audioEngine.playMizaanSound();
        break;
      default:
        audioEngine.playSoftChime();
        break;
    }

    setTimeout(() => {
      setIsSoundPlaying(false);
    }, 1200);
  }, [currentTool]);

  // Read Abu Rashid speech upon changing tool or when requested
  useEffect(() => {
    setGameState('inspecting');
    setCleanedPercent(0);
    setErrorCount(0);
    setActiveClueAnswer(null);
    setFeedbackMessage(null);
    setIsChestOpening(false);

    // Initial greeting from Abu Rashid for this round
    const message = `أهلاً بك يا بني في هذه الجولة من مزاد سوق لوّل! استمع إلى لغزي وافحص الأداة داخل الصندوق: ${currentTool.abuRashidRiddle}`;
    audioEngine.speak(message);
  }, [currentTool]);

  // Save persistence
  const saveProgress = (nextCompleted: string[], nextCoins: number) => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(nextCompleted));
      localStorage.setItem(STORAGE_KEY_COINS, String(nextCoins));
    } catch {
      // ignore
    }
  };

  // Handle Q&A Clues
  const handleAskQuestion = (type: 'madeOf' | 'usedWhere') => {
    audioEngine.playClick();
    if (type === 'madeOf') {
      const clue = { title: 'مِمَّ صُنعت هذه الأداة؟', text: currentTool.madeOfAnswer };
      setActiveClueAnswer(clue);
      audioEngine.speak(`صُنعت يا بني: ${currentTool.madeOfAnswer}`);
    } else {
      const clue = { title: 'أين كانت تُستخدم؟', text: currentTool.usedWhereAnswer };
      setActiveClueAnswer(clue);
      audioEngine.speak(`كانت تُستخدم يا بني: ${currentTool.usedWhereAnswer}`);
    }
    // Award 20% dust clean on asking clues
    setCleanedPercent((prev) => Math.min(100, prev + 20));
  };

  // Handle Choice Guessing
  const handleSelectChoice = (selectedId: string) => {
    if (gameState !== 'inspecting') return;

    if (selectedId === currentTool.id) {
      // Correct!
      audioEngine.playChestOpenGolden();
      setIsChestOpening(true);
      setCleanedPercent(100);
      setGameState('solved');
      setFeedbackMessage({
        text: `أحسنت القول والظن! نعم، إنها ${currentTool.name}. انفتحت خزانة الصندوق الذهبي!`
      });

      // Award +20 coins
      const nextCoins = lawwalCoins + 20;
      setLawwalCoins(nextCoins);
      saveProgress(completedToolIds, nextCoins);

      // Trigger floating coin animation
      setFloatingCoin(true);
      setTimeout(() => {
        audioEngine.playCoinsCollect();
      }, 400);
      setTimeout(() => {
        setFloatingCoin(false);
      }, 1500);

      audioEngine.speak(
        `أحسنت! هذه هي ${currentTool.name}. حصلت على عشرين قطعة نقدية! والآن اسحبها وضعها في مكانها التراثي الصحيح بالسوق.`
      );
    } else {
      // Incorrect
      audioEngine.playError();
      const nextErrors = errorCount + 1;
      setErrorCount(nextErrors);

      if (nextErrors >= 2) {
        // Reveal additional clue and auto-clear dust
        setCleanedPercent(100);
        setFeedbackMessage({
          text: `ركّز يا بني! إليك دليلاً إضافياً: ${currentTool.additionalClue}`,
          isError: true
        });
        audioEngine.speak(`ركّز يا بني! إليك دليلاً كاشفاً: ${currentTool.additionalClue}`);
      } else {
        setFeedbackMessage({
          text: 'ليست هذه الأداة يا بني، امسح مزيداً من الغبار واستمع لصوتها وحاول مجدداً!',
          isError: true
        });
        audioEngine.speak('ليست هذه الأداة يا بني، فكر ملياً وجرب مرة أخرى!');
      }
    }
  };

  // Handle Destination Placement (Drag & Drop or Direct Click)
  const handlePlaceAtDestination = (destinationId: DestinationId) => {
    if (gameState !== 'solved') return;

    if (destinationId === currentTool.destination) {
      // Correct placement!
      audioEngine.playCorrectPlacement();
      setGameState('placed');
      setFeedbackMessage({
        text: `ما شاء الله! وُضعت ${currentTool.name} في ${HERITAGE_DESTINATIONS[destinationId].name} على أصولها.`
      });

      // Update completed list
      let nextCompleted = completedToolIds;
      if (!completedToolIds.includes(currentTool.id)) {
        nextCompleted = [...completedToolIds, currentTool.id];
        setCompletedToolIds(nextCompleted);
        saveProgress(nextCompleted, lawwalCoins);
      }

      audioEngine.speak(
        `بارك الله فيك! مكانها التراثي الصحيح هو ${HERITAGE_DESTINATIONS[destinationId].name}. ${currentTool.usageDescription}`
      );

      // Check 5 tools milestone
      if (nextCompleted.length === 5 && !completedToolIds.includes(currentTool.id)) {
        setTimeout(() => {
          setIsSecretShopOpen(true);
          onCompleteStation();
        }, 1600);
      }
    } else {
      // Wrong destination
      audioEngine.playError();
      setFeedbackMessage({
        text: `ليست هنا يا بني! فكر أين تُستخدم ${currentTool.name} في الحياة اليومية؟`,
        isError: true
      });
      audioEngine.speak(
        `ليست هنا يا بني! هذه الأداة مكانها ليس في ${HERITAGE_DESTINATIONS[destinationId].name}، فكر أين كانت تُستخدم؟`
      );
    }
  };

  // Next round
  const handleNextRound = () => {
    audioEngine.playClick();
    setCurrentToolIndex((prev) => prev + 1);
  };

  // Reset progress confirmation
  const handleConfirmReset = () => {
    audioEngine.playClick();
    localStorage.removeItem(STORAGE_KEY_COMPLETED);
    localStorage.removeItem(STORAGE_KEY_COINS);
    setCompletedToolIds([]);
    setLawwalCoins(0);
    setCurrentToolIndex(0);
    setShowResetConfirm(false);
    audioEngine.speak('تمت إعادة ضبط المزاد. مرحباً بك مجدداً في سوق لوّل!');
  };

  const isToolCompleted = completedToolIds.includes(currentTool.id);
  const totalCompleted = completedToolIds.length;

  return (
    <div className="w-full bg-[#FAF6EE] rounded-3xl border-4 border-[#C7A15A] shadow-2xl p-4 sm:p-6 text-[#513A2E] relative overflow-hidden" dir="rtl">
      {/* Background Vintage Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#8A1538_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Header Banner: Title, Coins, Completed Progress, and Controls */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 border-b-2 border-[#C7A15A]/60 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8A1538] to-[#690B26] text-amber-300 border-2 border-[#C7A15A] flex items-center justify-center text-2xl shadow-md">
            🏺
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-[#8A1538] text-amber-200 px-2.5 py-0.5 rounded-full border border-[#C7A15A]">
                تجربة تفاعلية جديدة
              </span>
              <span className="text-xs font-bold text-stone-500">الجولة التراثية</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#8A1538] font-['Cairo']">
              «مزاد أسرار سوق لوّل»
            </h3>
          </div>
        </div>

        {/* Status Indicators & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Lawwal Coins */}
          <div className="relative px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[#513A2E] font-black text-xs sm:text-sm border-2 border-amber-600 shadow flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-[#8A1538]" />
            <span>نقود لوّل: {lawwalCoins}</span>

            {/* Floating +20 Coin Animation */}
            {floatingCoin && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#8A1538] text-amber-200 font-black text-xs px-2.5 py-0.5 rounded-full border border-amber-300 shadow-xl animate-bounce">
                +20 💰
              </span>
            )}
          </div>

          {/* Progress Badge */}
          <div className="px-3.5 py-1.5 rounded-full bg-[#8A1538] text-amber-200 font-black text-xs sm:text-sm border border-[#C7A15A] shadow flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>المكتشف: {totalCompleted}/5</span>
            {totalCompleted >= 5 && <span className="text-amber-300">🏅</span>}
          </div>

          {/* Secret Shop Access Button (if unlocked) */}
          {totalCompleted >= 5 && (
            <button
              onClick={() => setIsSecretShopOpen(true)}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#513A2E] font-black text-xs border border-white shadow transition active:scale-95 flex items-center gap-1 cursor-pointer animate-pulse"
              title="عرض الدكان السري والوسام"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>الدكان السري 🎁</span>
            </button>
          )}

          {/* Reset Game Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-[#8A1538] text-xs font-bold border border-[#C7A15A] shadow transition active:scale-95 flex items-center gap-1 cursor-pointer"
            title="بدء تجربة جديدة وتصفير التقدم"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#8A1538]" />
            <span className="hidden sm:inline">بدء تجربة جديدة</span>
          </button>
        </div>
      </div>

      {/* Merchant Abu Rashid Counter Banner */}
      <div className="relative z-10 bg-gradient-to-r from-[#F2E7D5] via-[#FAF6EE] to-[#F2E7D5] p-3 sm:p-4 rounded-2xl border-2 border-[#C7A15A] mb-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AbuRashidAvatar size={60} showName={false} />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-sm sm:text-base text-[#8A1538]">
                التاجر أبو راشد (صاحب الدكان):
              </h4>
              <span className="text-[11px] bg-amber-100 text-[#8A1538] px-2 py-0.5 rounded-full font-bold border border-amber-300">
                خلف الطاولة الخشبية
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#513A2E] leading-relaxed mt-0.5">
              {currentTool.abuRashidRiddle}
            </p>
          </div>
        </div>

        {/* Speak Riddle / Replay speech */}
        <button
          onClick={() => {
            audioEngine.speak(
              `يقول التاجر أبو راشد: ${currentTool.abuRashidRiddle}. استمع إلى صوتها أو اسألني مِمَّ صُنعت وأين كانت تُستخدم!`
            );
          }}
          className="shrink-0 px-3 py-1.5 rounded-full bg-[#8A1538] hover:bg-[#72112e] text-white text-xs font-bold flex items-center gap-1.5 shadow active:scale-95 transition cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-300" />
          <span>استمع لكلام أبو راشد</span>
        </button>
      </div>

      {/* Main Auction Arena: Left Stage (Chest & Interaction) & Right Controls (Clues & Choices) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: The Heritage Wooden Chest with Scratch/Dust Canvas */}
        <div className="lg:col-span-6 bg-gradient-to-b from-[#3D2517] via-[#2D1A10] to-[#1F120A] p-4 sm:p-5 rounded-3xl border-4 border-[#C7A15A] shadow-2xl text-amber-100 flex flex-col items-center justify-between relative overflow-hidden min-h-[420px]">
          {/* Brass Chest Corner Reinforcements */}
          <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-[#C7A15A] rounded-tr-lg pointer-events-none" />
          <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-[#C7A15A] rounded-tl-lg pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-[#C7A15A] rounded-br-lg pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-[#C7A15A] rounded-bl-lg pointer-events-none" />

          {/* Chest Top Status Bar */}
          <div className="w-full flex items-center justify-between border-b border-[#C7A15A]/40 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              {gameState === 'inspecting' ? (
                <Lock className="w-4 h-4 text-amber-400" />
              ) : (
                <Unlock className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-xs font-black text-amber-300">
                {gameState === 'inspecting' ? 'الصندوق التراثي مغلق' : 'انفتح الصندوق بنجاح!'}
              </span>
            </div>

            {/* Clean Progress Meter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-200">
                وضوح الأداة: {cleanedPercent}%
              </span>
              <div className="w-20 bg-black/50 h-2.5 rounded-full overflow-hidden border border-[#C7A15A]/60">
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-200 h-full transition-all duration-300"
                  style={{ width: `${cleanedPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Chest Centerpiece: Artifact & Dust Layer */}
          <div
            className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl flex items-center justify-center p-3 transition-all duration-500 ${
              gameState === 'solved' || gameState === 'placed'
                ? 'bg-gradient-to-b from-amber-900/40 to-black/60 ring-4 ring-[#C7A15A] shadow-[0_0_30px_rgba(199,161,90,0.6)]'
                : 'bg-black/50 border-2 border-[#C7A15A]/40'
            }`}
          >
            {/* The Artifact Visual (Silhouette or Clear) */}
            <AuctionArtifactVisual
              toolKey={currentTool.visualKey}
              isSilhouette={gameState === 'inspecting' && cleanedPercent < 90}
              dustPercent={100 - cleanedPercent}
              size="xl"
            />

            {/* The Interactive Dust Scratch Canvas (active during inspecting phase) */}
            {gameState === 'inspecting' && (
              <div className="absolute inset-0 p-2">
                <DustScratchCanvas
                  onProgress={(percent) => {
                    setCleanedPercent(percent);
                  }}
                  isCompleted={cleanedPercent >= 90}
                />
              </div>
            )}

            {/* Golden Burst on Solved */}
            {isChestOpening && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-amber-400/20 backdrop-blur-[1px] rounded-2xl animate-pulse">
                <div className="text-center p-3 bg-[#8A1538]/90 rounded-2xl border-2 border-amber-300 shadow-2xl">
                  <Sparkles className="w-8 h-8 text-amber-300 mx-auto animate-spin" />
                  <div className="text-sm font-black text-amber-200 mt-1">انفتحت أسرار الصندوق!</div>
                </div>
              </div>
            )}
          </div>

          {/* Sound & Audio Listen Button */}
          <div className="w-full mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[#C7A15A]/40">
            <button
              onClick={playCurrentToolSound}
              disabled={isSoundPlaying}
              className={`w-full sm:w-auto px-4 py-2 rounded-full font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-md cursor-pointer ${
                isSoundPlaying
                  ? 'bg-amber-400 text-[#513A2E] ring-2 ring-white animate-pulse'
                  : 'bg-gradient-to-r from-[#C7A15A] to-[#D8B46B] hover:from-[#d8b46b] hover:to-[#e4c47f] text-[#513A2E]'
              }`}
            >
              <Volume2 className="w-4 h-4 text-[#8A1538]" />
              <span>استمع إلى صوتها 🔊</span>
            </button>

            {/* Written Sound Label for Accessibility */}
            <div className="text-[11px] font-bold text-amber-200 bg-black/40 px-3 py-1 rounded-full border border-[#C7A15A]/40 text-center">
              الصوت: «{currentTool.soundLabel}»
            </div>
          </div>
        </div>

        {/* Right: Interactive Clues, Questions & Guessing Choices */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Phase 1: Guessing Phase (when not yet solved) */}
          {gameState === 'inspecting' && (
            <div className="bg-[#FAF6EE] p-4 sm:p-5 rounded-3xl border-3 border-[#8A1538] shadow-lg">
              <div className="flex items-center justify-between mb-3 border-b border-[#C7A15A]/50 pb-2">
                <h4 className="text-base sm:text-lg font-black text-[#8A1538] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#8A1538]" />
                  <span>اسأل التاجر أبو راشد واكتشف الأداة:</span>
                </h4>
                <span className="text-xs bg-amber-100 text-[#8A1538] font-black px-2 py-0.5 rounded-full border border-[#C7A15A]">
                  المرحلة الأولى
                </span>
              </div>

              {/* Abu Rashid Questions Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => handleAskQuestion('madeOf')}
                  className="p-2.5 rounded-2xl bg-white hover:bg-amber-50 text-[#8A1538] border-2 border-[#C7A15A] font-black text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <span>🔨 مِمَّ صُنعت؟</span>
                </button>

                <button
                  onClick={() => handleAskQuestion('usedWhere')}
                  className="p-2.5 rounded-2xl bg-white hover:bg-amber-50 text-[#8A1538] border-2 border-[#C7A15A] font-black text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <span>📍 أين كانت تُستخدم؟</span>
                </button>
              </div>

              {/* Active Clue Answer Box */}
              {activeClueAnswer && (
                <div className="bg-gradient-to-r from-amber-50 to-white p-3 rounded-2xl border border-[#C7A15A] mb-3 text-xs sm:text-sm font-bold text-[#513A2E] animate-fadeIn shadow-inner">
                  <div className="text-xs font-black text-[#8A1538] mb-1">
                    {activeClueAnswer.title}
                  </div>
                  <div>«{activeClueAnswer.text}»</div>
                </div>
              )}

              {/* Extra Clue after 2 errors */}
              {errorCount >= 2 && (
                <div className="bg-rose-50 p-3 rounded-2xl border-2 border-rose-300 mb-3 text-xs sm:text-sm font-bold text-rose-900 animate-pulse">
                  <span className="font-black text-[#8A1538]">💡 دليل كاشف من أبو راشد: </span>
                  <span>{currentTool.additionalClue}</span>
                </div>
              )}

              {/* 3 Illustrated Choice Cards */}
              <div className="mt-2">
                <div className="text-xs font-black text-[#513A2E] mb-2">
                  اختر الأداة الصحيحة المخفية في الصندوق:
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleSelectChoice(choice.id)}
                      className="w-full p-3 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-amber-50 hover:to-white border-2 border-[#C7A15A] text-[#513A2E] font-black text-sm sm:text-base flex items-center justify-between shadow-sm transition active:scale-98 hover:border-[#8A1538] cursor-pointer text-right group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-[#8A1538] group-hover:text-white flex items-center justify-center text-xl transition">
                          {choice.icon}
                        </div>
                        <span className="group-hover:text-[#8A1538] transition font-['Cairo']">
                          {choice.name}
                        </span>
                      </div>
                      <span className="text-xs bg-amber-50 group-hover:bg-[#8A1538] group-hover:text-white px-3 py-1 rounded-full text-[#8A1538] font-bold border border-[#C7A15A]/60 transition">
                        اختر هذه الأداة ➔
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Phase 2: Placement Phase (when solved or placed) */}
          {(gameState === 'solved' || gameState === 'placed') && (
            <div className="bg-[#FAF6EE] p-4 sm:p-5 rounded-3xl border-3 border-emerald-700 shadow-lg">
              <div className="flex items-center justify-between mb-3 border-b border-[#C7A15A]/50 pb-2">
                <div>
                  <span className="text-xs bg-emerald-100 text-emerald-900 font-black px-2.5 py-0.5 rounded-full border border-emerald-300">
                    المرحلة الثانية: التوزيع التراثي
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-[#8A1538] mt-1">
                    أين مكان {currentTool.name} في الحياة القطرية؟
                  </h4>
                </div>
                <div className="text-2xl">📍</div>
              </div>

              {/* Draggable/Tappable Tool Pill */}
              <div
                draggable={gameState === 'solved'}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', currentTool.id);
                  setIsDragging(true);
                }}
                onDragEnd={() => setIsDragging(false)}
                className={`p-3 rounded-2xl bg-gradient-to-r from-amber-100 to-amber-200 border-2 border-[#8A1538] shadow-md flex items-center justify-between mb-4 ${
                  gameState === 'solved' ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#8A1538] text-amber-200 flex items-center justify-center text-xl shadow">
                    {currentTool.icon}
                  </div>
                  <div>
                    <div className="font-black text-sm text-[#8A1538]">{currentTool.name}</div>
                    <div className="text-[11px] text-[#513A2E] font-bold">
                      {gameState === 'solved'
                        ? 'اسحب هذه البطاقة أو انقر على المكان الصحيح أدناه'
                        : 'تمت إعادتها لمكانها بنجاح ✓'}
                    </div>
                  </div>
                </div>

                {gameState === 'solved' && (
                  <span className="text-xs bg-[#8A1538] text-white px-3 py-1 rounded-full font-black animate-pulse">
                    اسحب أو انقر ➔
                  </span>
                )}
              </div>

              {/* 4 Heritage Destination Zones */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {(Object.keys(HERITAGE_DESTINATIONS) as DestinationId[]).map((destId) => {
                  const dest = HERITAGE_DESTINATIONS[destId];
                  const isTarget = currentTool.destination === destId;
                  const isPlacedHere = gameState === 'placed' && isTarget;

                  return (
                    <div
                      key={destId}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handlePlaceAtDestination(destId);
                      }}
                      onClick={() => {
                        if (gameState === 'solved') {
                          handlePlaceAtDestination(destId);
                        }
                      }}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[105px] text-right cursor-pointer select-none ${
                        isPlacedHere
                          ? 'bg-emerald-100 border-emerald-600 shadow-md ring-2 ring-emerald-500'
                          : gameState === 'solved'
                          ? 'bg-white hover:bg-amber-50 hover:border-[#8A1538] hover:shadow'
                          : 'bg-stone-50 border-stone-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{dest.icon}</span>
                        {isPlacedHere && (
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black">
                            موقعها الصحيح ✓
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-black text-xs sm:text-sm text-[#8A1538]">{dest.name}</div>
                        <div className="text-[10px] text-stone-600 font-bold leading-tight line-clamp-2 mt-0.5">
                          {dest.hint}
                        </div>
                      </div>

                      {gameState === 'solved' && (
                        <div className="text-[10px] font-black text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full text-center mt-1 border border-amber-300/60">
                          انقر لوضع الأداة هنا
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Comprehensive Heritage Information Card after Placed */}
              {gameState === 'placed' && (
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-[#FAF6EE] border-2 border-[#C7A15A] shadow-inner text-xs sm:text-sm font-bold text-[#513A2E] animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-[#C7A15A]/60 pb-2 mb-2">
                    <span className="font-black text-[#8A1538] text-sm sm:text-base flex items-center gap-1.5">
                      <span>📜 بطاقة التراث: {currentTool.name}</span>
                    </span>
                    <span className="text-[11px] bg-[#8A1538] text-white px-2.5 py-0.5 rounded-full font-black">
                      {HERITAGE_DESTINATIONS[currentTool.destination].name}
                    </span>
                  </div>

                  <p className="mb-2 leading-relaxed">
                    <strong className="text-[#8A1538]">الاستخدام التراثي: </strong>
                    {currentTool.usageDescription}
                  </p>

                  <p className="mb-3 leading-relaxed text-[#513A2E]/90 bg-white/70 p-2.5 rounded-xl border border-amber-200">
                    <strong className="text-amber-800">معلومة تراثية: </strong>
                    {currentTool.heritageFact}
                  </p>

                  {/* 3D Model button specifically for Dallah */}
                  {currentTool.id === 'dallah' && (
                    <button
                      onClick={onOpenDallah3D}
                      className="w-full mb-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-[#8A1538] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-200 font-black text-xs sm:text-sm shadow-md border border-amber-300 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>استعرض مجسم الدلة 3D التفاعلي (360°) 🫖</span>
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Next Round Button */}
                  <button
                    onClick={handleNextRound}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#8A1538] hover:bg-[#72112e] text-white font-black text-xs sm:text-sm shadow-lg border border-[#C7A15A] transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>الانتقال للأداة التراثية التالية في المزاد</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Real-time Feedback Banner */}
          {feedbackMessage && (
            <div
              className={`p-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 border shadow-sm ${
                feedbackMessage.isError
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}
            >
              {feedbackMessage.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Secret Shop & Stamp Modal */}
      <SecretShopModal
        isOpen={isSecretShopOpen}
        onClose={() => setIsSecretShopOpen(false)}
        onContinueToVillage={() => {
          setIsSecretShopOpen(false);
          onCompleteStation();
        }}
        onContinuePlaying={() => {
          setIsSecretShopOpen(false);
          handleNextRound();
        }}
        completedCount={totalCompleted}
        totalToolsCount={AUCTION_TOOLS.length}
        lawwalCoins={lawwalCoins}
      />

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" dir="rtl">
          <div className="bg-[#FAF6EE] p-6 rounded-3xl border-4 border-[#8A1538] max-w-md w-full text-center shadow-2xl text-[#513A2E]">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-[#8A1538] mx-auto flex items-center justify-center text-2xl mb-3 border-2 border-rose-300">
              ⚠️
            </div>
            <h4 className="text-xl font-black text-[#8A1538] mb-2">
              بدء تجربة جديدة؟
            </h4>
            <p className="text-sm font-bold text-stone-600 mb-5 leading-relaxed">
              هل تود إعادة تعيين تقدم مزاد سوق لوّل والبدء من جديد مع التاجر أبو راشد؟
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-5 py-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs sm:text-sm cursor-pointer transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-full bg-[#8A1538] hover:bg-[#72112e] text-white font-black text-xs sm:text-sm shadow border border-[#C7A15A] cursor-pointer transition"
              >
                نعم، ابدأ من جديد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
