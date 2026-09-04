import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Clock, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Compass, ShieldAlert } from 'lucide-react';
import { audioEngine } from '../services/audioService';
import { StationModalWrapper } from './StationModalWrapper';

interface PearlSeaStationProps {
  onComplete: () => void;
  onBackToVillage: () => void;
}

interface SeaItem {
  id: string;
  lane: number;
  x: number;
  y: number;
  type: 'oyster' | 'dana' | 'rare' | 'jellyfish' | 'rock';
  size: number;
  speedY: number;
}

interface SparkleParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  char: string;
  size: number;
  alpha: number;
  decay: number;
  rotation: number;
  rotSpeed: number;
}

interface ParticleBurst {
  id: string;
  x: number;
  y: number;
  type: 'oyster' | 'dana' | 'rare';
  text: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  lane: number;
  age: number;
  maxAge: number;
  particles: SparkleParticle[];
}

export const PearlSeaStation: React.FC<PearlSeaStationProps> = ({ onComplete, onBackToVillage }) => {
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [oysterCount, setOysterCount] = useState<number>(0);
  const [danaCount, setDanaCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [, setTick] = useState<number>(0);

  // Geometric Grid Configuration: 7 symmetrical vertical lanes (lane 3 is center axis)
  const LANES_COUNT = 7;

  // Diver position & state
  const diverPos = useRef<{ x: number; y: number }>({ x: 350, y: 240 });
  const diverSpeed = useRef<number>(5.5);
  const isSlowed = useRef<boolean>(false);
  const slowTimer = useRef<NodeJS.Timeout | null>(null);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const itemsRef = useRef<SeaItem[]>([]);
  const burstsRef = useRef<ParticleBurst[]>([]);
  const lanePulseRef = useRef<{ [lane: number]: number }>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const triggerCollectionBurst = (item: SeaItem) => {
    const burstId = `burst-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const count = item.type === 'rare' ? 16 : item.type === 'dana' ? 12 : 10;
    const particles: SparkleParticle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count;
      const baseSpeed = item.type === 'rare' ? 3.4 : item.type === 'dana' ? 3.0 : 2.5;
      const speed = baseSpeed + (i % 2) * 1.2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      let char = '✦';
      let color = '#FDE68A';

      if (item.type === 'dana') {
        const chars = ['💎', '✦', '◇', '✨', '✧', '💠'];
        const colors = ['#22D3EE', '#67E8F9', '#A5F3FC', '#FFFFFF', '#38BDF8', '#7DD3FC'];
        char = chars[i % chars.length];
        color = colors[i % colors.length];
      } else if (item.type === 'rare') {
        const chars = ['⭐', '✦', '💎', '✨', '🌟', '✧'];
        const colors = ['#FDE047', '#FEF08A', '#22D3EE', '#FFFFFF', '#F59E0B', '#FBCFE8'];
        char = chars[i % chars.length];
        color = colors[i % colors.length];
      } else {
        const chars = ['🐚', '✦', '✨', '✧', '○'];
        const colors = ['#FDE68A', '#F59E0B', '#C7A15A', '#FFFFFF', '#FEF08A'];
        char = chars[i % chars.length];
        color = colors[i % colors.length];
      }

      particles.push({
        id: `${burstId}-p-${i}`,
        x: item.x,
        y: item.y,
        vx,
        vy,
        color,
        char,
        size: item.type === 'dana' || item.type === 'rare' ? (i % 2 === 0 ? 18 : 14) : (i % 2 === 0 ? 16 : 13),
        alpha: 1,
        decay: 0.026,
        rotation: (i * 360) / count,
        rotSpeed: i % 2 === 0 ? 3.5 : -3.5
      });
    }

    // Highlight the geometric grid lane of collection
    lanePulseRef.current[item.lane] = Date.now() + 450;

    const text = item.type === 'rare' ? '+100 دانة نادرة!' : item.type === 'dana' ? '+50 دانة!' : '+10 محار!';
    const badgeBg = item.type === 'rare' ? 'bg-yellow-950/90' : item.type === 'dana' ? 'bg-cyan-950/90' : 'bg-amber-950/90';
    const badgeBorder = item.type === 'rare' ? 'border-yellow-300' : item.type === 'dana' ? 'border-cyan-300' : 'border-amber-300';
    const badgeText = item.type === 'rare' ? 'text-yellow-200' : item.type === 'dana' ? 'text-cyan-200' : 'text-amber-200';

    burstsRef.current.push({
      id: burstId,
      x: item.x,
      y: item.y,
      type: item.type,
      text,
      badgeBg,
      badgeBorder,
      badgeText,
      lane: item.lane,
      age: 0,
      maxAge: 36,
      particles
    });
  };

  const spawnItemInLane = (lane: number, y: number) => {
    const container = containerRef.current;
    const width = container ? container.clientWidth : 700;
    const laneWidth = width / LANES_COUNT;
    // Exactly aligned with the geometric lane axis
    const x = Math.round((lane + 0.5) * laneWidth);

    const rand = Math.random();
    let type: SeaItem['type'] = 'oyster';
    let speedY = 0.6;
    const size = 64; // Precision 64px symmetrical badge

    if (rand < 0.44) {
      type = 'oyster'; // 🐚 44%
      speedY = 0.55;
    } else if (rand < 0.68) {
      type = 'dana'; // 💎 24%
      speedY = 0.65;
    } else if (rand < 0.78) {
      type = 'rare'; // ⭐ 10%
      speedY = 0.8;
    } else if (rand < 0.90) {
      type = 'jellyfish'; // 🪼 12%
      speedY = 0.85;
    } else {
      type = 'rock'; // 🪨 10%
      speedY = 0.35;
    }

    itemsRef.current.push({
      id: `sea-grid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      lane,
      x,
      y,
      type,
      size,
      speedY
    });
  };

  // Initialize Sea Audio Zone & Diver game loop
  useEffect(() => {
    audioEngine.setZone('sea');
    audioEngine.speak('أهلاً بك في بحر اللؤلؤ! نطبق التوازن الهندسي لمغاصات الهيرات. غص في أعماق الخليج واجمع المحار والدانات المتناظرة وتفادَ قناديل البحر.');

    // Reset items and place diver dead-center in the water canvas
    itemsRef.current = [];
    const container = containerRef.current;
    const initialWidth = container ? container.clientWidth : 700;
    const initialHeight = container ? container.clientHeight : 440;
    diverPos.current = { x: Math.round(initialWidth / 2), y: Math.round(initialHeight / 2) };

    // Initial items strictly distributed across the symmetrical geometric lanes
    for (let i = 0; i < 14; i++) {
      const lane = i % LANES_COUNT;
      const initialY = 70 + Math.floor(i / LANES_COUNT) * 160 + (lane % 2 === 0 ? 0 : 40);
      spawnItemInLane(lane, initialY);
    }

    // 60-second game timer
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Keyboard listener
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Animation Loop
    let lastSpawn = Date.now();
    const loop = () => {
      if (isGameOver) return;

      const containerEl = containerRef.current;
      const width = containerEl ? containerEl.clientWidth : 700;
      const height = containerEl ? containerEl.clientHeight : 440;
      const laneWidth = width / LANES_COUNT;

      // Handle Diver movement
      const speed = isSlowed.current ? diverSpeed.current * 0.4 : diverSpeed.current;
      if (keysPressed.current['arrowup'] || keysPressed.current['w']) {
        diverPos.current.y = Math.max(65, diverPos.current.y - speed);
      }
      if (keysPressed.current['arrowdown'] || keysPressed.current['s']) {
        diverPos.current.y = Math.min(height - 70, diverPos.current.y + speed);
      }
      if (keysPressed.current['arrowleft'] || keysPressed.current['a']) {
        diverPos.current.x = Math.max(65, diverPos.current.x - speed);
      }
      if (keysPressed.current['arrowright'] || keysPressed.current['d']) {
        diverPos.current.x = Math.min(width - 65, diverPos.current.x + speed);
      }

      // Spawn new items periodically locked to a precise geometric lane
      if (Date.now() - lastSpawn > 1200 && itemsRef.current.length < 14) {
        const lane = Math.floor(Math.random() * LANES_COUNT);
        spawnItemInLane(lane, height + 45);
        lastSpawn = Date.now();
      }

      // Move items upwards along their disciplined vertical geometric grid track
      itemsRef.current.forEach((item) => {
        item.y -= item.speedY;
        // Keep strictly centered on the mathematical lane column
        item.x = Math.round((item.lane + 0.5) * laneWidth);
      });

      // Filter out off-screen items
      itemsRef.current = itemsRef.current.filter((it) => it.y > -75);

      // Check Diver Collision with items
      const diverX = diverPos.current.x;
      const diverY = diverPos.current.y;

      const remainingItems: SeaItem[] = [];
      itemsRef.current.forEach((item) => {
        const dist = Math.hypot(diverX - item.x, diverY - item.y);
        if (dist < 68) {
          // Collected!
          handleItemCollision(item);
        } else {
          remainingItems.push(item);
        }
      });
      itemsRef.current = remainingItems;

      // Update active particle bursts and floating achievement labels
      const updatedBursts: ParticleBurst[] = [];
      burstsRef.current.forEach((burst) => {
        burst.age += 1;
        burst.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy -= 0.04; // buoyant upward float in sea water
          p.alpha = Math.max(0, p.alpha - p.decay);
          p.rotation += p.rotSpeed;
        });
        if (burst.age < burst.maxAge) {
          updatedBursts.push(burst);
        }
      });
      burstsRef.current = updatedBursts;

      // Re-render tick for smooth 60fps animations
      setTick((t) => (t + 1) % 100000);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      clearInterval(timerInterval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (slowTimer.current) clearTimeout(slowTimer.current);
    };
  }, [isGameOver]);

  const handleItemCollision = (item: SeaItem) => {
    switch (item.type) {
      case 'oyster':
        setScore((prev) => prev + 10);
        setOysterCount((prev) => prev + 1);
        audioEngine.playPearlCollect('normal');
        triggerCollectionBurst(item);
        break;
      case 'dana':
        setScore((prev) => prev + 50);
        setDanaCount((prev) => prev + 1);
        audioEngine.playPearlCollect('dana');
        triggerCollectionBurst(item);
        break;
      case 'rare':
        setScore((prev) => prev + 100);
        setDanaCount((prev) => prev + 1);
        audioEngine.playPearlCollect('rare');
        triggerCollectionBurst(item);
        break;
      case 'jellyfish':
        setScore((prev) => Math.max(0, prev - 10));
        audioEngine.playError();
        break;
      case 'rock':
        audioEngine.playError();
        isSlowed.current = true;
        if (slowTimer.current) clearTimeout(slowTimer.current);
        slowTimer.current = setTimeout(() => {
          isSlowed.current = false;
        }, 1500);
        break;
    }
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    audioEngine.playSuccess();
    setShowSummaryModal(true);
  };

  // On-screen touch directional helpers
  const handleTouchDirection = (dir: 'up' | 'down' | 'left' | 'right', pressed: boolean) => {
    if (dir === 'up') keysPressed.current['arrowup'] = pressed;
    if (dir === 'down') keysPressed.current['arrowdown'] = pressed;
    if (dir === 'left') keysPressed.current['arrowleft'] = pressed;
    if (dir === 'right') keysPressed.current['arrowright'] = pressed;
  };

  return (
    <div className="min-h-[calc(100vh-56px)] w-full bg-gradient-to-b from-[#09263a] via-[#051a28] to-[#020d14] p-3 md:p-6 text-[#F7F1E5] flex flex-col items-center justify-center select-none overflow-x-hidden">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-3 md:gap-3.5">
        
        {/* Top Centered Header & Symmetrical Navigation */}
        <div className="w-full flex items-center justify-between border-b border-cyan-400/30 pb-2.5">
          <button
            onClick={onBackToVillage}
            className="px-3.5 py-1.5 rounded-xl bg-[#513A2E] text-[#F7F1E5] font-bold text-xs md:text-sm flex items-center gap-1.5 hover:bg-[#3D291D] border border-[#C7A15A]/40 transition-colors shadow"
          >
            <ArrowRight className="w-4 h-4" />
            <span>القرية</span>
          </button>

          {/* Centered Identity Title */}
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[10px] md:text-xs font-semibold text-cyan-200">
              <Compass className="w-3.5 h-3.5 text-[#C7A15A] animate-spin" />
              <span>هوية التوازن الهندسي • مغاصات الهيرات</span>
            </div>
            <h1 className="text-lg md:text-xl font-black text-[#F7F1E5] tracking-wide mt-0.5">
              بحر اللؤلؤ القطري
            </h1>
          </div>

          <div className="px-3 py-1 rounded-xl bg-[#0a334d]/60 border border-cyan-400/30 text-cyan-300 font-bold text-xs flex items-center gap-1">
            <span>🌊</span>
            <span className="hidden sm:inline">مغاصات قطر</span>
          </div>
        </div>

        {/* Centered Mathematical HUD Stats Bar */}
        <div className="w-full flex items-center justify-center flex-wrap gap-2 md:gap-3 text-xs md:text-sm font-bold">
          <div className="px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/60 text-cyan-200 flex items-center gap-1.5 shadow-sm">
            <Clock className="w-4 h-4 text-cyan-300 animate-spin" />
            <span>الوقت: {timeLeft}ث</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-400/60 text-amber-200 flex items-center gap-1.5 shadow-sm">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>النقاط: {score}</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-[#0a334d]/90 border border-cyan-400/40 text-cyan-100 flex items-center gap-1.5 shadow-sm">
            <span>🐚 المحار: {oysterCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-[#0a334d]/90 border border-cyan-400/40 text-cyan-100 flex items-center gap-1.5 shadow-sm">
            <span>💎 الدانات: {danaCount}</span>
          </div>
        </div>

        {/* Centered Educational Banner: Geometric Heritage Balance */}
        <div className="w-full max-w-3xl mx-auto bg-gradient-to-r from-cyan-950/60 via-[#0a334d]/85 to-cyan-950/60 border border-cyan-500/40 rounded-2xl px-4 py-2.5 flex items-center justify-center text-center gap-2.5 shadow-lg backdrop-blur-xs">
          <span className="text-xl shrink-0">🧭</span>
          <p className="text-xs md:text-sm text-cyan-100 font-medium leading-relaxed">
            <strong className="text-[#C7A15A]">التوازن الهندسي للمغاصات:</strong> اعتمد أجدادنا على التناظر الهندسي للنجوم و«الديرة» (البوصلة البحرية المقسمة لـ 32 خناً) لتحديد مواقع مغاصات اللؤلؤ الطبيعي (الهيرات) في عمق الخليج بدقة متناهية.
          </p>
        </div>

        {/* Centered Underwater Play Area with Precision Geometric Grid */}
        <div
          ref={containerRef}
          className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[450px] rounded-3xl border-4 border-cyan-500/60 shadow-2xl overflow-hidden bg-gradient-to-b from-[#08334c] to-[#021420] backdrop-blur-sm"
        >
          {/* Geometric Corner Accents */}
          <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-cyan-300 pointer-events-none z-10" />
          <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-cyan-300 pointer-events-none z-10" />
          <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-cyan-300 pointer-events-none z-10" />
          <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-cyan-300 pointer-events-none z-10" />

          {/* Symmetrical Sunbeam through ocean water */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/25 via-transparent to-transparent pointer-events-none" />

          {/* Symmetrical Geometric Coordinate Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* 7 Vertical Geometric Grid Lanes */}
            <div className="w-full h-full flex justify-between divide-x divide-cyan-400/10">
              {Array.from({ length: LANES_COUNT }).map((_, i) => {
                const isPulsing = Boolean(lanePulseRef.current[i] && lanePulseRef.current[i] > Date.now());
                return (
                  <div
                    key={i}
                    className={`flex-1 relative flex flex-col justify-between items-center py-2.5 border-r border-cyan-400/10 transition-colors duration-200 ${
                      isPulsing ? 'bg-gradient-to-b from-cyan-400/25 via-cyan-400/10 to-transparent' : ''
                    }`}
                  >
                    <span className={`text-[9px] font-mono tracking-widest uppercase transition-colors ${isPulsing ? 'text-cyan-200 font-bold' : 'text-cyan-400/30'}`}>
                      G{i + 1}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full border transition-all duration-200 ${isPulsing ? 'border-cyan-200 scale-150 bg-cyan-300 shadow-[0_0_10px_#22d3ee]' : 'border-cyan-400/20'}`} />
                    <span className={`text-[9px] font-mono transition-colors ${isPulsing ? 'text-cyan-200 font-bold' : 'text-cyan-400/30'}`}>
                      {isPulsing ? '✦' : '◇'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Symmetrical Central Axis Guide */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-cyan-400/30 via-cyan-400/15 to-transparent" />

            {/* Depth Level Indicator */}
            <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 border-b border-dashed border-cyan-400/15 flex items-center justify-between px-3 text-[9px] text-cyan-300/30 font-mono">
              <span>محور التوازن الهندسي</span>
              <span>عمق الهيرات • ٥ أمتار</span>
              <span>محور التوازن الهندسي</span>
            </div>
          </div>

          {/* Sea Bed Sandy Ground */}
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#D8C29D]/40 to-transparent pointer-events-none border-t border-cyan-500/20 z-10" />

          {/* Swimming Diver (Photo Asset - Doubled Size 112px) */}
          <div
            className="absolute z-20 transition-transform duration-75 flex flex-col items-center pointer-events-none"
            style={{
              left: `${diverPos.current.x - 56}px`,
              top: `${diverPos.current.y - 56}px`,
              filter: isSlowed.current ? 'hue-rotate(90deg) brightness(0.8)' : 'none'
            }}
          >
            <div className="relative w-28 h-28">
              {/* Real Diver Underwater Photograph */}
              <div className="w-full h-full rounded-full overflow-hidden border-3 border-cyan-300 shadow-2xl ring-4 ring-cyan-500/40 bg-cyan-950 flex items-center justify-center relative">
                <img
                  src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=300&h=300&q=80"
                  alt="غواص في أعماق الخليج"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none pointer-events-none transform scale-110 drop-shadow"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/50 via-transparent to-cyan-200/20 pointer-events-none" />
                <div className="absolute bottom-1 bg-black/60 backdrop-blur-xs text-[9px] text-cyan-200 px-2 py-0.5 rounded-full font-bold">
                  غواص
                </div>
              </div>
              <div className="absolute -top-2 left-3 w-4 h-4 rounded-full bg-cyan-200/80 animate-ping pointer-events-none" />
              <div className="absolute -top-4 left-6 w-2.5 h-2.5 rounded-full bg-white/70 animate-pulse pointer-events-none" />
            </div>
            {isSlowed.current && (
              <span className="text-xs bg-rose-900 text-rose-200 px-2.5 py-0.5 rounded-full font-bold shadow mt-1">بطيء!</span>
            )}
          </div>

          {/* Symmetrical Underwater Collectible Items Aligned to Geometric Lanes */}
          {itemsRef.current.map((item) => {
            return (
              <div
                key={item.id}
                className="absolute pointer-events-none transition-all duration-100 flex items-center justify-center z-10"
                style={{
                  left: `${item.x - 32}px`,
                  top: `${item.y - 32}px`,
                  width: `${item.size}px`,
                  height: `${item.size}px`
                }}
              >
                {item.type === 'oyster' && (
                  /* 🐚 المحار: إطار هندسي متناظر بأركان مربعة ذهبية */
                  <div className="relative w-16 h-16 rounded-2xl border-2 border-amber-300/70 bg-amber-950/60 backdrop-blur-xs flex items-center justify-center shadow-lg shadow-amber-950/60 ring-2 ring-amber-400/30">
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-amber-200" />
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-amber-200" />
                    <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-amber-200" />
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-amber-200" />
                    <div className="w-11 h-11 rounded-full border border-amber-400/40 flex items-center justify-center bg-amber-900/30">
                      <span className="text-3xl select-none filter drop-shadow">🐚</span>
                    </div>
                  </div>
                )}

                {item.type === 'dana' && (
                  /* 💎 الدانة: إطار ماسي هندسي ثماني الأوجه بلون فيروزي متناظر */
                  <div className="relative w-16 h-16 rounded-2xl border-2 border-cyan-300/80 bg-cyan-950/60 backdrop-blur-xs flex items-center justify-center shadow-lg shadow-cyan-950/70 ring-2 ring-cyan-400/40">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-300 rotate-45" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-300 rotate-45" />
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-cyan-300 rotate-45" />
                    <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-cyan-300 rotate-45" />
                    <div className="w-11 h-11 rounded-xl rotate-45 border border-cyan-300/50 flex items-center justify-center bg-cyan-900/40">
                      <span className="text-3xl -rotate-45 select-none filter drop-shadow">💎</span>
                    </div>
                  </div>
                )}

                {item.type === 'rare' && (
                  /* ⭐ اللؤلؤة النادرة: نجمة متناظرة ذات إشعاع ذهبي متناسق */
                  <div className="relative w-16 h-16 rounded-2xl border-2 border-yellow-300 bg-yellow-950/70 backdrop-blur-xs flex items-center justify-center shadow-xl shadow-yellow-950/80 ring-4 ring-yellow-400/40 animate-pulse">
                    <div className="absolute inset-1 rounded-xl border border-yellow-200/50" />
                    <span className="text-3xl select-none filter drop-shadow-lg">⭐</span>
                  </div>
                )}

                {item.type === 'jellyfish' && (
                  /* 🪼 قنديل البحر: إطار تحذيري هندسي متناظر متناسق */
                  <div className="relative w-16 h-16 rounded-2xl border-2 border-purple-400/80 bg-purple-950/60 backdrop-blur-xs flex items-center justify-center shadow-lg shadow-purple-950/60 ring-2 ring-purple-400/30">
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 px-1 text-[8px] text-purple-300 font-mono uppercase tracking-wider">خطر</div>
                    <div className="w-11 h-11 rounded-full border border-purple-400/40 flex items-center justify-center bg-purple-900/30">
                      <span className="text-3xl select-none filter drop-shadow">🪼</span>
                    </div>
                  </div>
                )}

                {item.type === 'rock' && (
                  /* 🪨 صخرة القاع: مضلع متزن هندسي */
                  <div className="relative w-16 h-16 rounded-2xl border-2 border-stone-400/70 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center shadow-lg shadow-black/50 ring-2 ring-stone-400/30">
                    <div className="w-11 h-11 rounded-lg border border-stone-500/40 flex items-center justify-center bg-stone-800/40">
                      <span className="text-3xl select-none filter drop-shadow">🪨</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Geometric Particle Bursts on Dana & Oyster Collection */}
          {burstsRef.current.map((burst) => {
            const progress = burst.age / burst.maxAge; // 0 to 1
            const shockwaveRadius = 24 + progress * 65;
            const shockwaveOpacity = Math.max(0, 1 - progress);

            return (
              <div key={burst.id} className="absolute inset-0 pointer-events-none z-30 overflow-visible">
                {/* Expanding Geometric Symmetrical Shockwave / Ring */}
                {burst.type === 'dana' ? (
                  /* Diamond shockwave for Dana */
                  <div
                    className="absolute border-2 border-cyan-300 shadow-lg shadow-cyan-500/50 rotate-45 pointer-events-none transition-transform"
                    style={{
                      left: `${burst.x - shockwaveRadius}px`,
                      top: `${burst.y - shockwaveRadius}px`,
                      width: `${shockwaveRadius * 2}px`,
                      height: `${shockwaveRadius * 2}px`,
                      opacity: shockwaveOpacity,
                      borderRadius: '16px'
                    }}
                  />
                ) : burst.type === 'rare' ? (
                  /* Concentric double starburst ring for Rare pearl */
                  <>
                    <div
                      className="absolute border-2 border-yellow-300 shadow-xl shadow-yellow-500/60 rotate-45 pointer-events-none"
                      style={{
                        left: `${burst.x - shockwaveRadius}px`,
                        top: `${burst.y - shockwaveRadius}px`,
                        width: `${shockwaveRadius * 2}px`,
                        height: `${shockwaveRadius * 2}px`,
                        opacity: shockwaveOpacity,
                        borderRadius: '20px'
                      }}
                    />
                    <div
                      className="absolute border border-cyan-200 pointer-events-none rounded-full"
                      style={{
                        left: `${burst.x - shockwaveRadius * 0.7}px`,
                        top: `${burst.y - shockwaveRadius * 0.7}px`,
                        width: `${shockwaveRadius * 1.4}px`,
                        height: `${shockwaveRadius * 1.4}px`,
                        opacity: shockwaveOpacity
                      }}
                    />
                  </>
                ) : (
                  /* Symmetrical concentric golden ring for Oyster */
                  <div
                    className="absolute border-2 border-dashed border-amber-300 shadow-md shadow-amber-500/40 pointer-events-none rounded-full"
                    style={{
                      left: `${burst.x - shockwaveRadius}px`,
                      top: `${burst.y - shockwaveRadius}px`,
                      width: `${shockwaveRadius * 2}px`,
                      height: `${shockwaveRadius * 2}px`,
                      opacity: shockwaveOpacity
                    }}
                  />
                )}

                {/* Symmetrical Radiating Sparkle Particles */}
                {burst.particles.map((p) => (
                  <div
                    key={p.id}
                    className="absolute pointer-events-none select-none flex items-center justify-center font-bold"
                    style={{
                      left: `${p.x}px`,
                      top: `${p.y}px`,
                      color: p.color,
                      fontSize: `${p.size}px`,
                      opacity: p.alpha,
                      transform: `translate(-50%, -50%) rotate(${p.rotation}deg) scale(${Math.max(0.4, p.alpha)})`,
                      filter: `drop-shadow(0 0 6px ${p.color})`
                    }}
                  >
                    {p.char}
                  </div>
                ))}

                {/* Floating Geometric Achievement Label */}
                <div
                  className={`absolute -translate-x-1/2 pointer-events-none font-black text-xs md:text-sm px-3 py-1 rounded-full shadow-xl border backdrop-blur-md flex items-center gap-1.5 transition-transform ${burst.badgeBg} ${burst.badgeBorder} ${burst.badgeText}`}
                  style={{
                    left: `${burst.x}px`,
                    top: `${burst.y - 32 - progress * 42}px`,
                    opacity: Math.max(0, 1 - progress * 1.25),
                    transform: `translateX(-50%) scale(${1 + progress * 0.15})`
                  }}
                >
                  <span>{burst.type === 'dana' ? '💎' : burst.type === 'rare' ? '⭐' : '🐚'}</span>
                  <span>{burst.text}</span>
                </div>
              </div>
            );
          })}

          {/* Hint banner for controls */}
          <div className="absolute top-2.5 right-8 bg-black/50 px-3 py-1 rounded-full text-[11px] text-cyan-200 pointer-events-none backdrop-blur-xs border border-cyan-400/20">
            تحكم بالغواص بالأسهم أو WASD أو أزرار اللمس
          </div>
        </div>

        {/* Centered Symmetrical Touch D-Pad for Tablets & Mobile */}
        <div className="w-full flex flex-col items-center justify-center gap-1.5 my-1">
          <button
            onMouseDown={() => handleTouchDirection('up', true)}
            onMouseUp={() => handleTouchDirection('up', false)}
            onTouchStart={() => handleTouchDirection('up', true)}
            onTouchEnd={() => handleTouchDirection('up', false)}
            className="w-14 h-11 rounded-xl bg-[#0b3147] text-[#C7A15A] border-2 border-[#C7A15A]/60 flex items-center justify-center font-black active:scale-95 shadow-md hover:bg-[#0f405c] transition-all"
            title="تحريك لأعلى"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <button
              onMouseDown={() => handleTouchDirection('right', true)}
              onMouseUp={() => handleTouchDirection('right', false)}
              onTouchStart={() => handleTouchDirection('right', true)}
              onTouchEnd={() => handleTouchDirection('right', false)}
              className="w-14 h-11 rounded-xl bg-[#0b3147] text-[#C7A15A] border-2 border-[#C7A15A]/60 flex items-center justify-center font-black active:scale-95 shadow-md hover:bg-[#0f405c] transition-all"
              title="تحريك لليمين"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="w-9 h-9 rounded-full border border-cyan-400/40 bg-cyan-950/70 flex items-center justify-center text-xs text-cyan-300">
              🧭
            </div>
            <button
              onMouseDown={() => handleTouchDirection('left', true)}
              onMouseUp={() => handleTouchDirection('left', false)}
              onTouchStart={() => handleTouchDirection('left', true)}
              onTouchEnd={() => handleTouchDirection('left', false)}
              className="w-14 h-11 rounded-xl bg-[#0b3147] text-[#C7A15A] border-2 border-[#C7A15A]/60 flex items-center justify-center font-black active:scale-95 shadow-md hover:bg-[#0f405c] transition-all"
              title="تحريك لليسار"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <button
            onMouseDown={() => handleTouchDirection('down', true)}
            onMouseUp={() => handleTouchDirection('down', false)}
            onTouchStart={() => handleTouchDirection('down', true)}
            onTouchEnd={() => handleTouchDirection('down', false)}
            className="w-14 h-11 rounded-xl bg-[#0b3147] text-[#C7A15A] border-2 border-[#C7A15A]/60 flex items-center justify-center font-black active:scale-95 shadow-md hover:bg-[#0f405c] transition-all"
            title="تحريك لأسفل"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        {/* Centered Symmetrical Game Items Legend */}
        <div className="w-full max-w-3xl mx-auto flex items-center justify-center flex-wrap gap-2 text-xs">
          <div className="px-3 py-1 rounded-full bg-amber-950/50 border border-amber-300/40 text-amber-200 flex items-center gap-1.5 shadow-sm">
            <span>🐚</span>
            <span>محار (+10)</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-300/40 text-cyan-200 flex items-center gap-1.5 shadow-sm">
            <span>💎</span>
            <span>دانة ثمينة (+50)</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-yellow-950/50 border border-yellow-300/50 text-yellow-200 flex items-center gap-1.5 shadow-sm">
            <span>⭐</span>
            <span>لؤلؤة نادرة (+100)</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-purple-950/50 border border-purple-400/40 text-purple-200 flex items-center gap-1.5 shadow-sm">
            <span>🪼</span>
            <span>قنديل بحر (-10)</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-stone-900/50 border border-stone-400/40 text-stone-300 flex items-center gap-1.5 shadow-sm">
            <span>🪨</span>
            <span>صخرة قاع (إبطاء)</span>
          </div>
        </div>

      </div>

      {/* Completion Modal */}
      <StationModalWrapper
        isOpen={showSummaryModal}
        stationName="بحر اللؤلؤ"
        stamp="🌊"
        subtitle={`جمعت ${score} نقطة بتوازن هندسي دقيق (${oysterCount} محار و${danaCount} دانة)! عرفت قطر تاريخيًا بمغاصات اللؤلؤ الطبيعي العريقة المسماة «الهيرات» في مياه الخليج العربي.`}
        onContinue={() => {
          setShowSummaryModal(false);
          onComplete();
        }}
      />
    </div>
  );
};
