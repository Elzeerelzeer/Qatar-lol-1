import React from 'react';

export type ArtifactVisualKey =
  | 'dallah'
  | 'sadu'
  | 'mabkhara'
  | 'pottery'
  | 'diving'
  | 'mandoos'
  | 'raha'
  | 'mizaan';

interface AuctionArtifactVisualProps {
  toolKey: ArtifactVisualKey;
  isSilhouette?: boolean;
  dustPercent?: number; // 0 (clear) to 100 (fully covered in dust)
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AuctionArtifactVisual: React.FC<AuctionArtifactVisualProps> = ({
  toolKey,
  isSilhouette = false,
  dustPercent = 0,
  size = 'lg',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-12 h-14',
    md: 'w-20 h-24',
    lg: 'w-36 h-44 sm:w-44 sm:h-52',
    xl: 'w-48 h-56 sm:w-60 sm:h-68'
  }[size];

  // Opacity for full color art based on dust cleanliness (100 - dustPercent)
  const revealRatio = Math.max(0, Math.min(1, (100 - dustPercent) / 100));

  const renderContent = () => {
    switch (toolKey) {
      case 'dallah':
        // الدلّة القطرية
        return (
          <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-xl" aria-label="الدلة القطرية">
            <defs>
              <linearGradient id="goldGradDallah" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F9E29D" />
                <stop offset="50%" stopColor="#C7A15A" />
                <stop offset="100%" stopColor="#875F25" />
              </linearGradient>
            </defs>
            {/* Top Spire & Crown */}
            <path d="M 50 18 L 50 8 L 46 4 L 54 4 L 50 8" stroke="#8A1538" strokeWidth="2.5" fill="url(#goldGradDallah)" />
            <ellipse cx="50" cy="20" rx="17" ry="6" fill="#C7A15A" stroke="#513A2E" strokeWidth="2" />
            {/* Upper Neck */}
            <path d="M 37 22 L 41 48 L 59 48 L 63 22 Z" fill="url(#goldGradDallah)" stroke="#513A2E" strokeWidth="2" />
            <ellipse cx="50" cy="48" rx="13" ry="4" fill="#875F25" />
            {/* Bulbous Body */}
            <path d="M 34 50 Q 18 84 50 96 Q 82 84 66 50 Z" fill="url(#goldGradDallah)" stroke="#513A2E" strokeWidth="2" />
            {/* Flared Base */}
            <path d="M 34 94 L 28 118 L 72 118 L 66 94 Z" fill="#C7A15A" stroke="#513A2E" strokeWidth="2" />
            {/* Curved Spout (منقار الدلة) */}
            <path d="M 61 40 Q 94 33 88 16 Q 84 18 76 34 Q 60 48 54 53" fill="url(#goldGradDallah)" stroke="#513A2E" strokeWidth="2" />
            {/* Handle (المقبض العريض) */}
            <path d="M 38 34 Q 6 52 18 88 Q 25 98 38 90" fill="none" stroke="#513A2E" strokeWidth="5" strokeLinecap="round" />
            <path d="M 38 34 Q 10 52 20 88 Q 26 96 38 90" fill="none" stroke="#C7A15A" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      case 'sadu':
        // نسيج السدو التراثي
        return (
          <div className="w-full h-full flex items-center justify-center p-2" aria-label="نسيج السدو">
            <div className="w-full h-full bg-[#8A1538] rounded-xl border-4 border-[#C7A15A] shadow-xl p-2 flex flex-col justify-around relative overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:8px_8px]" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center px-1 z-10">
                  <div className="w-3 h-3 bg-[#F7F1E5] rotate-45 border border-[#8A1538]" />
                  <div className="w-4 h-1.5 bg-[#C7A15A] rounded-full" />
                  <div className="w-3.5 h-3.5 bg-[#1A1A1A] rotate-45 border border-[#C7A15A]" />
                  <div className="w-4 h-1.5 bg-[#D8C29D] rounded-full" />
                  <div className="w-3 h-3 bg-[#F7F1E5] rotate-45 border border-[#8A1538]" />
                </div>
              ))}
              <div className="text-center font-black text-[9px] text-amber-200 tracking-widest uppercase border-t border-[#C7A15A]/60 pt-0.5">
                سدو قطر
              </div>
            </div>
          </div>
        );

      case 'mabkhara':
        // المبخرة والعود
        return (
          <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-xl" aria-label="المبخرة والعود">
            <defs>
              <linearGradient id="woodMabkhara" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="60%" stopColor="#8A1538" />
                <stop offset="100%" stopColor="#4A0D1E" />
              </linearGradient>
            </defs>
            {/* Smoke Plumes */}
            <path d="M 45 22 Q 38 12 47 3" stroke="#F7F1E5" strokeWidth="2.5" fill="none" strokeDasharray="3 3" className="animate-pulse" />
            <path d="M 55 18 Q 62 8 53 2" stroke="#F7F1E5" strokeWidth="2.5" fill="none" strokeDasharray="3 3" className="animate-pulse [animation-delay:200ms]" />
            {/* Top Bowl (مقر الجمر) */}
            <polygon points="16,28 84,28 72,56 28,56" fill="url(#woodMabkhara)" stroke="#513A2E" strokeWidth="2.5" />
            {/* Glowing Embers (جمر العود) */}
            <ellipse cx="50" cy="34" rx="24" ry="5" fill="#E65100" />
            <circle cx="44" cy="33" r="2.5" fill="#FFD54F" />
            <circle cx="54" cy="34" r="3" fill="#FFAB00" />
            {/* Corner finials */}
            <rect x="18" y="24" width="7" height="10" rx="2" fill="#C7A15A" stroke="#513A2E" strokeWidth="1" />
            <rect x="75" y="24" width="7" height="10" rx="2" fill="#C7A15A" stroke="#513A2E" strokeWidth="1" />
            {/* Slender Waist */}
            <rect x="40" y="56" width="20" height="26" fill="#C7A15A" stroke="#513A2E" strokeWidth="2.5" />
            <line x1="50" y1="56" x2="50" y2="82" stroke="#8A1538" strokeWidth="3" />
            {/* Flared Pyramid Base */}
            <polygon points="26,82 74,82 88,120 12,120" fill="url(#woodMabkhara)" stroke="#513A2E" strokeWidth="2.5" />
            {/* Metal Studs on Base */}
            <circle cx="50" cy="104" r="4.5" fill="#C7A15A" stroke="#513A2E" strokeWidth="1" />
            <circle cx="32" cy="106" r="3.5" fill="#C7A15A" />
            <circle cx="68" cy="106" r="3.5" fill="#C7A15A" />
          </svg>
        );

      case 'pottery':
        // الجرة الفخارية (الجحلة / اليزلة)
        return (
          <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-xl" aria-label="الجرة الفخارية">
            <defs>
              <linearGradient id="clayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D2996E" />
                <stop offset="50%" stopColor="#B26E40" />
                <stop offset="100%" stopColor="#753C1A" />
              </linearGradient>
            </defs>
            {/* Rim */}
            <ellipse cx="50" cy="18" rx="16" ry="6" fill="#D2996E" stroke="#513A2E" strokeWidth="2" />
            {/* Neck & Round Clay Belly */}
            <path d="M 37 20 L 39 36 Q 16 70 50 106 Q 84 70 61 36 L 63 20 Z" fill="url(#clayGrad)" stroke="#513A2E" strokeWidth="2.5" />
            {/* Stable Clay Base */}
            <path d="M 36 106 L 36 120 L 64 120 L 64 106 Z" fill="#753C1A" stroke="#513A2E" strokeWidth="2" />
            {/* Twin Handles (العروتان) */}
            <path d="M 37 38 Q 16 48 30 66" fill="none" stroke="#513A2E" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 63 38 Q 84 48 70 66" fill="none" stroke="#513A2E" strokeWidth="4.5" strokeLinecap="round" />
            {/* Traditional Engraved Band */}
            <path d="M 30 68 Q 50 78 70 68" fill="none" stroke="#F7F1E5" strokeWidth="2" strokeDasharray="4 3" />
          </svg>
        );

      case 'diving':
        // الفطام وأدوات الغوص على اللؤلؤ والمحار
        return (
          <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-xl" aria-label="الفطام وأدوات الغوص">
            <defs>
              <radialGradient id="pearlGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="70%" stopColor="#F5EDDE" />
                <stop offset="100%" stopColor="#C7A15A" />
              </radialGradient>
            </defs>
            {/* Al-Fitam (مشجب الأنف من عظم السلاحف) */}
            <path d="M 28 32 C 22 14, 48 14, 42 32 C 37 44, 23 44, 28 32 Z" fill="#EADCC2" stroke="#513A2E" strokeWidth="2.5" />
            <line x1="35" y1="20" x2="35" y2="35" stroke="#8A1538" strokeWidth="1.5" />
            {/* Al-Miflaqah (المفلقة لفتح المحار) */}
            <path d="M 64 22 L 88 78 L 81 83 L 58 28 Z" fill="#B0BEC5" stroke="#513A2E" strokeWidth="2" />
            <rect x="76" y="74" width="13" height="32" rx="3" fill="#5D4037" stroke="#C7A15A" strokeWidth="1.5" />
            {/* Opened Pearl Oyster Shell */}
            <path d="M 16 88 Q 45 60 74 88 Q 45 116 16 88 Z" fill="#E0D2BC" stroke="#8A1538" strokeWidth="2.5" />
            {/* The Dana Pearl (الدانة الثمينة) */}
            <circle cx="45" cy="88" r="9" fill="url(#pearlGlow)" stroke="#C7A15A" strokeWidth="1.5" />
            <circle cx="42" cy="85" r="2.5" fill="#FFFFFF" />
          </svg>
        );

      case 'mandoos':
        // المندوس (الصندوق الخشبي المصفح بالمسامير النحاسية)
        return (
          <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-xl" aria-label="المندوس التراثي">
            <defs>
              <linearGradient id="teakWood" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5C2C16" />
                <stop offset="50%" stopColor="#3E1A0A" />
                <stop offset="100%" stopColor="#250F05" />
              </linearGradient>
            </defs>
            {/* Chest Lid (الغطاء المحدب) */}
            <path d="M 12 44 Q 50 30 88 44 L 84 56 L 16 56 Z" fill="url(#teakWood)" stroke="#C7A15A" strokeWidth="2.5" />
            {/* Chest Main Body */}
            <rect x="14" y="56" width="72" height="52" rx="4" fill="url(#teakWood)" stroke="#C7A15A" strokeWidth="2.5" />
            {/* Brass Corner Reinforcements */}
            <polygon points="14,56 26,56 14,68" fill="#C7A15A" />
            <polygon points="86,56 74,56 86,68" fill="#C7A15A" />
            <polygon points="14,108 26,108 14,96" fill="#C7A15A" />
            <polygon points="86,108 74,108 86,96" fill="#C7A15A" />
            {/* Central Brass Latch & Heavy Padlock (القفل النحاسي) */}
            <rect x="44" y="50" width="12" height="20" rx="2" fill="#D4AF37" stroke="#513A2E" strokeWidth="1.5" />
            <path d="M 47 62 A 3 3 0 1 1 53 62 L 53 68 L 47 68 Z" fill="#513A2E" />
            {/* Decorative Brass Studs (المسامير النحاسية الذهبية) */}
            <circle cx="28" cy="70" r="2.5" fill="#D4AF37" />
            <circle cx="38" cy="70" r="2.5" fill="#D4AF37" />
            <circle cx="62" cy="70" r="2.5" fill="#D4AF37" />
            <circle cx="72" cy="70" r="2.5" fill="#D4AF37" />
            <circle cx="28" cy="94" r="2.5" fill="#D4AF37" />
            <circle cx="38" cy="94" r="2.5" fill="#D4AF37" />
            <circle cx="62" cy="94" r="2.5" fill="#D4AF37" />
            <circle cx="72" cy="94" r="2.5" fill="#D4AF37" />
            {/* Brass Base Legs */}
            <rect x="20" y="108" width="10" height="8" rx="1" fill="#C7A15A" stroke="#513A2E" strokeWidth="1" />
            <rect x="70" y="108" width="10" height="8" rx="1" fill="#C7A15A" stroke="#513A2E" strokeWidth="1" />
          </svg>
        );

      case 'raha':
        // الرحى (طاحونة الحبوب الحجرية)
        return (
          <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-xl" aria-label="حجر الرحى">
            <defs>
              <linearGradient id="stoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9E9E9E" />
                <stop offset="50%" stopColor="#616161" />
                <stop offset="100%" stopColor="#37474F" />
              </linearGradient>
            </defs>
            {/* Base Stone Disc (الحجر السفلي الثابت) */}
            <ellipse cx="50" cy="92" rx="38" ry="18" fill="#455A64" stroke="#263238" strokeWidth="3" />
            <ellipse cx="50" cy="86" rx="38" ry="18" fill="url(#stoneGrad)" stroke="#263238" strokeWidth="2.5" />
            {/* Upper Stone Disc (الحجر العلوي الدوّار) */}
            <ellipse cx="50" cy="74" rx="34" ry="16" fill="#37474F" stroke="#212121" strokeWidth="3" />
            <ellipse cx="50" cy="68" rx="34" ry="16" fill="url(#stoneGrad)" stroke="#212121" strokeWidth="2.5" />
            {/* Central Grain Eye (عين الرحى لوضع القمح) */}
            <ellipse cx="50" cy="68" rx="7" ry="3.5" fill="#212121" />
            {/* Wooden Turning Handle (المقبض الخشبي القائم) */}
            <rect x="68" y="32" width="6" height="38" rx="3" fill="#8D6E63" stroke="#3E2723" strokeWidth="2" />
            <circle cx="71" cy="32" r="4.5" fill="#D7CCC8" stroke="#3E2723" strokeWidth="1.5" />
            {/* Golden Grain Grains Scatter (حبات القمح والطحين) */}
            <circle cx="34" cy="96" r="1.5" fill="#FFD54F" />
            <circle cx="39" cy="98" r="1.5" fill="#FFE082" />
            <circle cx="60" cy="97" r="1.5" fill="#FFD54F" />
            <circle cx="66" cy="95" r="1.5" fill="#FFF8E1" />
          </svg>
        );

      case 'mizaan':
        // الميزان القديم (ذو الكفتين والصنج)
        return (
          <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-xl" aria-label="الميزان القديم">
            <defs>
              <linearGradient id="brassBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="50%" stopColor="#C7A15A" />
                <stop offset="100%" stopColor="#8D6E63" />
              </linearGradient>
            </defs>
            {/* Top Ring & Vertical Central Pillar */}
            <circle cx="50" cy="18" r="4" fill="none" stroke="#C7A15A" strokeWidth="2" />
            <line x1="50" y1="22" x2="50" y2="52" stroke="#513A2E" strokeWidth="3" />
            <circle cx="50" cy="38" r="5" fill="#C7A15A" stroke="#513A2E" strokeWidth="1.5" />
            {/* Horizontal Balance Beam (ذراع الميزان) */}
            <line x1="16" y1="40" x2="84" y2="40" stroke="url(#brassBeam)" strokeWidth="4" strokeLinecap="round" />
            {/* Left Pan Chains & Pan */}
            <line x1="20" y1="40" x2="14" y2="78" stroke="#513A2E" strokeWidth="1.2" />
            <line x1="20" y1="40" x2="26" y2="78" stroke="#513A2E" strokeWidth="1.2" />
            <path d="M 10 78 Q 20 88 30 78 Z" fill="#C7A15A" stroke="#513A2E" strokeWidth="2" />
            {/* Brass Weights on Left Pan (الصنج) */}
            <rect x="18" y="72" width="5" height="7" fill="#8A1538" stroke="#513A2E" strokeWidth="1" />
            {/* Right Pan Chains & Pan */}
            <line x1="80" y1="40" x2="74" y2="78" stroke="#513A2E" strokeWidth="1.2" />
            <line x1="80" y1="40" x2="86" y2="78" stroke="#513A2E" strokeWidth="1.2" />
            <path d="M 70 78 Q 80 88 90 78 Z" fill="#C7A15A" stroke="#513A2E" strokeWidth="2" />
            {/* Goods / Spices on Right Pan */}
            <ellipse cx="80" cy="77" rx="7" ry="2.5" fill="#E65100" />
            {/* Base Stand */}
            <polygon points="40,118 60,118 54,92 46,92" fill="#C7A15A" stroke="#513A2E" strokeWidth="2" />
            <line x1="50" y1="52" x2="50" y2="92" stroke="#513A2E" strokeWidth="3" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${sizeClasses} ${className}`}>
      {/* Full Colored SVG */}
      <div
        className="w-full h-full flex items-center justify-center transition-all duration-500"
        style={{
          filter: isSilhouette
            ? `brightness(${0.08 + revealRatio * 0.92}) contrast(${1.8 - revealRatio * 0.8}) drop-shadow(0 0 10px rgba(199, 161, 90, ${0.4 + revealRatio * 0.6}))`
            : undefined,
          opacity: isSilhouette ? 0.35 + revealRatio * 0.65 : 1
        }}
      >
        {renderContent()}
      </div>

      {/* Silhouette Mystery Fog / Question Mark Badge if mostly silhouette */}
      {isSilhouette && revealRatio < 0.35 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-[#8A1538]/80 text-amber-300 flex items-center justify-center text-2xl font-black shadow-lg border-2 border-[#C7A15A] animate-pulse">
            ؟
          </div>
        </div>
      )}
    </div>
  );
};
