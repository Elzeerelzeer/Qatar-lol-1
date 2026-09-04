import React, { useRef, useEffect, useState, useCallback } from 'react';
import { audioEngine } from '../services/audioService';
import { Sparkles, Wand2 } from 'lucide-react';

interface DustScratchCanvasProps {
  onProgress: (cleanedPercent: number) => void;
  isCompleted?: boolean;
  disabled?: boolean;
  className?: string;
}

export const DustScratchCanvas: React.FC<DustScratchCanvasProps> = ({
  onProgress,
  isCompleted = false,
  disabled = false,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastSoundTimeRef = useRef<number>(0);
  const [cleanedPercent, setCleanedPercent] = useState<number>(0);

  // Initialize canvas with heritage dust texture (sand, specks, subtle golden dust)
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Reset composite
    ctx.globalCompositeOperation = 'source-over';

    // 1. Warm sand/desert dust base gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#7A5A38');
    grad.addColorStop(0.5, '#5A3E22');
    grad.addColorStop(1, '#3E2A15');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Sand grain particles
    for (let i = 0; i < 450; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 2.2 + 0.5;
      const alpha = Math.random() * 0.35 + 0.1;
      ctx.fillStyle = Math.random() > 0.4 ? `rgba(216, 194, 157, ${alpha})` : `rgba(199, 161, 90, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Vintage decorative dust vignette border
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.25,
      width / 2, height / 2, Math.min(width, height) * 0.7
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(30, 18, 10, 0.65)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    setCleanedPercent(0);
    onProgress(0);
  }, [onProgress]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  // When round completes or requested to clear
  useEffect(() => {
    if (isCompleted) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setCleanedPercent(100);
      onProgress(100);
    }
  }, [isCompleted, onProgress]);

  // Measure clean percentage (sampled pixels)
  const checkCleanPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    try {
      const { width, height } = canvas;
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      let transparentPixels = 0;
      const sampleStep = 32; // sampled every 32 bytes (8 pixels) for high performance
      const totalSamples = data.length / sampleStep;

      for (let i = 3; i < data.length; i += sampleStep) {
        if (data[i] < 64) {
          transparentPixels++;
        }
      }

      const percent = Math.min(100, Math.round((transparentPixels / totalSamples) * 100));
      setCleanedPercent(percent);
      onProgress(percent);
    } catch {
      // ignore
    }
  };

  // Scratch action at (x, y)
  const scratchAt = (clientX: number, clientY: number) => {
    if (disabled || isCompleted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    const radius = Math.min(canvas.width, canvas.height) * 0.16; // Generous wiping radius

    const scratchGrad = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
    scratchGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    scratchGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.85)');
    scratchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = scratchGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Sound with throttle
    const now = Date.now();
    if (now - lastSoundTimeRef.current > 110) {
      audioEngine.playDustWipe();
      lastSoundTimeRef.current = now;
    }
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    scratchAt(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    scratchAt(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      checkCleanPercentage();
    }
  };

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      isDrawingRef.current = true;
      const touch = e.touches[0];
      scratchAt(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    scratchAt(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      checkCleanPercentage();
    }
  };

  // Accessible Instant Clean Tool
  const handleBrushWipe = () => {
    if (disabled || isCompleted) return;
    audioEngine.playDustWipe();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear next 40% step
    const nextPercent = Math.min(100, cleanedPercent + 40);
    if (nextPercent >= 85) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setCleanedPercent(100);
      onProgress(100);
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      // Erase large center circle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, (canvas.width / 2) * (nextPercent / 100), 0, Math.PI * 2);
      ctx.fill();
      setCleanedPercent(nextPercent);
      onProgress(nextPercent);
    }
  };

  return (
    <div className={`relative select-none touch-none ${className}`}>
      <canvas
        ref={canvasRef}
        width={340}
        height={340}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full h-full rounded-2xl cursor-grab active:cursor-grabbing border-2 border-[#C7A15A]/60 shadow-inner ${
          isCompleted ? 'pointer-events-none opacity-0' : 'opacity-95'
        } transition-opacity duration-500`}
        aria-label="امسح الغبار بإصبعك أو الفأرة لرؤية الأداة"
      />

      {/* Floating Prompt & Quick Clean Button */}
      {!isCompleted && cleanedPercent < 80 && (
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between gap-1 pointer-events-auto">
          <div className="bg-[#2E1A11]/85 backdrop-blur-sm text-amber-200 text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#C7A15A]/60 flex items-center gap-1.5 shadow">
            <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
            <span>حرّك إصبعك لمسح الغبار ({cleanedPercent}%)</span>
          </div>

          <button
            type="button"
            onClick={handleBrushWipe}
            className="bg-[#C7A15A] hover:bg-[#d8b46b] text-[#513A2E] text-[11px] font-black px-3 py-1 rounded-full shadow border border-white flex items-center gap-1 active:scale-95 transition cursor-pointer"
            title="مسح الغبار تلقائياً"
          >
            <Wand2 className="w-3 h-3" />
            <span>فرشاة التاجر 🧹</span>
          </button>
        </div>
      )}
    </div>
  );
};
