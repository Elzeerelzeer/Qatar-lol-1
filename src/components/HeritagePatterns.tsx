import React, { useEffect, useRef } from 'react';

// Qatari Nine Serrated Points (علم قطر التراثي)
export const QatariSerration: React.FC<{ className?: string; color?: string }> = ({
  className = '',
  color = '#8A1538'
}) => {
  return (
    <div className={`flex w-full overflow-hidden ${className}`}>
      {Array.from({ length: 9 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 40"
          className="flex-1 h-4 md:h-6"
          preserveAspectRatio="none"
        >
          <polygon points="0,0 20,20 0,40" fill={color} />
        </svg>
      ))}
    </div>
  );
};

// Authentic Sadu Border (نقش السدو القطري)
export const SaduBorder: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full h-4 bg-[#8A1538] flex items-center justify-around overflow-hidden border-y border-[#C7A15A] ${className}`}>
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-1 space-x-reverse">
          <div className="w-1.5 h-1.5 bg-[#F7F1E5] rotate-45" />
          <div className="w-1 h-2 bg-[#D8C29D]" />
          <div className="w-1.5 h-1.5 bg-[#C7A15A] rotate-45" />
          <div className="w-1 h-1 bg-[#1A1A1A]" />
        </div>
      ))}
    </div>
  );
};

// Gypsum Carving Pattern (النقوش الجبسية القطرية)
export const GypsumArchPattern: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full flex justify-center items-center py-2 ${className}`}>
      <svg viewBox="0 0 400 30" className="w-full max-w-lg h-6 text-[#C7A15A]" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M0,15 Q25,0 50,15 T100,15 T150,15 T200,15 T250,15 T300,15 T350,15 T400,15" />
        <circle cx="50" cy="15" r="3" fill="#8A1538" />
        <circle cx="100" cy="15" r="3" fill="#8A1538" />
        <circle cx="150" cy="15" r="3" fill="#8A1538" />
        <circle cx="200" cy="15" r="4" fill="#C7A15A" />
        <circle cx="250" cy="15" r="3" fill="#8A1538" />
        <circle cx="300" cy="15" r="3" fill="#8A1538" />
        <circle cx="350" cy="15" r="3" fill="#8A1538" />
      </svg>
    </div>
  );
};

// Traditional Lantern (فانوس قديم مع إضاءة دافئة متحركة)
export const HeritageLantern: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 64
}) => {
  return (
    <div className={`relative inline-block animate-swing origin-top ${className}`} style={{ width: size, height: size * 1.5 }}>
      {/* Hanging Chain */}
      <div className="w-0.5 h-6 bg-[#C7A15A] mx-auto" />
      {/* Lantern Cap */}
      <div className="w-8 h-3 bg-[#513A2E] rounded-t-full mx-auto border border-[#C7A15A]" />
      {/* Lantern Glass Body with Glow */}
      <div className="relative w-10 h-14 mx-auto bg-gradient-to-b from-[#C7A15A]/30 via-[#D8C29D]/60 to-[#C7A15A]/40 rounded-lg border-2 border-[#513A2E] overflow-hidden flex items-center justify-center shadow-lg shadow-amber-400/30">
        <div className="w-3 h-5 bg-amber-200 rounded-full blur-[1px] animate-pulse shadow-md shadow-amber-300" />
        {/* Metal ribs */}
        <div className="absolute inset-0 flex justify-between px-2 pointer-events-none">
          <div className="w-0.5 h-full bg-[#513A2E]/50" />
          <div className="w-0.5 h-full bg-[#513A2E]/50" />
        </div>
      </div>
      {/* Lantern Base */}
      <div className="w-8 h-3 bg-[#513A2E] rounded-b-md mx-auto border-t border-[#C7A15A]" />
    </div>
  );
};

// Golden Dust and Sparkles Canvas
export const GoldenSparklesCanvas: React.FC<{ count?: number }> = ({ count = 35 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedY: Math.random() * 0.6 + 0.2,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.8 + 0.2,
      pulse: Math.random() * 0.05 + 0.01,
      pulseDir: 1
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.opacity += p.pulse * p.pulseDir;
        if (p.opacity >= 0.95) p.pulseDir = -1;
        if (p.opacity <= 0.15) p.pulseDir = 1;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(199, 161, 90, ${p.opacity})`;
        ctx.shadowColor = '#C7A15A';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [count]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />;
};
