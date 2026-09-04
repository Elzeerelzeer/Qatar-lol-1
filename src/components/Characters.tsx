import React from 'react';
import { Volume2 } from 'lucide-react';
import { audioEngine } from '../services/audioService';

// Abu Rashid - Cultural Heritage Guide (المرشد أبو راشد)
export const AbuRashidAvatar: React.FC<{
  size?: number;
  className?: string;
  isTalking?: boolean;
  showName?: boolean;
}> = ({ size = 180, className = '', isTalking = false, showName = true }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div
        className={`relative transition-transform duration-300 ${isTalking ? 'scale-105 animate-pulse' : ''}`}
        style={{ width: size, height: size * 1.3 }}
      >
        <svg viewBox="0 0 200 260" className="w-full h-full drop-shadow-xl overflow-visible">
          <defs>
            <linearGradient id="bishtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8A1538" />
              <stop offset="60%" stopColor="#690e29" />
              <stop offset="100%" stopColor="#513A2E" />
            </linearGradient>
            <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F5D77F" />
              <stop offset="50%" stopColor="#C7A15A" />
              <stop offset="100%" stopColor="#E2B755" />
            </linearGradient>
            <radialGradient id="skinTone" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#F8D3B0" />
              <stop offset="100%" stopColor="#E3AB7E" />
            </radialGradient>
          </defs>

          {/* Bisht Cloak (Body) */}
          <path d="M 30 140 Q 10 200 15 260 L 185 260 Q 190 200 170 140 Q 100 120 30 140 Z" fill="url(#bishtGrad)" />

          {/* Golden Zari Trim along Bisht neckline & opening */}
          <path d="M 75 145 L 85 260" stroke="url(#goldTrim)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 125 145 L 115 260" stroke="url(#goldTrim)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 75 145 Q 100 180 125 145" stroke="url(#goldTrim)" strokeWidth="5" fill="none" />

          {/* Inner White Thobe */}
          <path d="M 85 145 L 85 260 L 115 260 L 115 145 Z" fill="#FDFBF7" />
          {/* Thobe Collar */}
          <rect x="92" y="130" width="16" height="25" rx="3" fill="#FFFFFF" stroke="#E2D9C8" strokeWidth="1" />

          {/* Head & Neck */}
          <rect x="88" y="105" width="24" height="30" fill="url(#skinTone)" rx="6" />
          {/* Face */}
          <ellipse cx="100" cy="85" rx="36" ry="42" fill="url(#skinTone)" />

          {/* Friendly warm wrinkles / smile lines */}
          <path d="M 72 75 Q 68 80 72 85" stroke="#C28A61" strokeWidth="1.5" fill="none" />
          <path d="M 128 75 Q 132 80 128 85" stroke="#C28A61" strokeWidth="1.5" fill="none" />

          {/* Eyes (warm & kind) */}
          <ellipse cx="84" cy="80" rx="4.5" ry="3.5" fill="#3D291D" />
          <ellipse cx="116" cy="80" rx="4.5" ry="3.5" fill="#3D291D" />
          <circle cx="86" cy="78" r="1.5" fill="#FFFFFF" />
          <circle cx="118" cy="78" r="1.5" fill="#FFFFFF" />

          {/* White Eyebrows */}
          <path d="M 76 72 Q 85 68 94 72" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 106 72 Q 115 68 124 72" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Nose */}
          <path d="M 97 82 Q 100 93 103 93" stroke="#B87C53" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Friendly White Mustache and Beard */}
          <path d="M 80 94 Q 100 102 120 94 Q 128 106 100 115 Q 72 106 80 94 Z" fill="#F8F8F8" stroke="#E0E0E0" strokeWidth="1" />
          <path d="M 82 100 Q 100 145 118 100 Q 100 112 82 100 Z" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1" />

          {/* Gentle Smile inside mustache */}
          <path d="M 94 101 Q 100 106 106 101" stroke="#8A1538" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* White Qatari Ghutra (غترة بيضاء متهدلة) */}
          <path d="M 52 75 Q 60 30 100 30 Q 140 30 148 75 Q 165 140 160 210 Q 135 150 135 110 L 65 110 Q 65 150 40 210 Q 35 140 52 75 Z" fill="#FFFFFF" stroke="#ECE8DF" strokeWidth="2" />

          {/* Black Agal (عقال قطري أسود مميز مع خزام) */}
          <ellipse cx="100" cy="46" rx="40" ry="12" fill="none" stroke="#1A1A1A" strokeWidth="8" />
          <ellipse cx="100" cy="42" rx="38" ry="10" fill="none" stroke="#2D2D2D" strokeWidth="6" />
          {/* Agal dangling cords (الكركوشة) behind shoulder */}
          <path d="M 132 50 Q 145 100 142 160" stroke="#1A1A1A" strokeWidth="3.5" fill="none" strokeLinecap="round" />

          {/* Welcoming Hand gesture */}
          <circle cx="160" cy="180" r="14" fill="url(#skinTone)" />
          <path d="M 152 176 Q 165 168 172 178" stroke="#B87C53" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {showName && (
        <div className="mt-2 px-4 py-1 rounded-full bg-[#8A1538] border-2 border-[#C7A15A] text-[#F7F1E5] font-bold text-sm md:text-base shadow-md">
          أبو راشد (المرشد)
        </div>
      )}
    </div>
  );
};

// Visitor Avatar (الزائر القطري)
export const VisitorAvatar: React.FC<{
  size?: number;
  className?: string;
  showName?: boolean;
}> = ({ size = 180, className = '', showName = true }) => {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {showName && (
        <div className="mb-2 px-4 py-1 rounded-full bg-[#C7A15A] border-2 border-[#513A2E] text-[#513A2E] font-black text-sm md:text-base shadow-md">
          الزائر
        </div>
      )}

      <div className="relative" style={{ width: size, height: size * 1.3 }}>
        <svg viewBox="0 0 200 260" className="w-full h-full drop-shadow-xl overflow-visible">
          <defs>
            <radialGradient id="kidSkin" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#FFE0BD" />
              <stop offset="100%" stopColor="#F5C096" />
            </radialGradient>
          </defs>

          {/* White Crisp Thobe (ثوب قطري أبيض ناصع) */}
          <path d="M 50 140 L 35 260 L 165 260 L 150 140 Q 100 125 50 140 Z" fill="#FFFFFF" stroke="#E6E0D5" strokeWidth="2" />
          {/* Thobe Pocket (جيب الثوب) */}
          <rect x="65" y="160" width="22" height="26" rx="2" fill="#FAF7F2" stroke="#E0D7C6" strokeWidth="1.5" />
          {/* Collar & Buttons */}
          <rect x="92" y="125" width="16" height="35" rx="3" fill="#FFFFFF" stroke="#DDD6C6" strokeWidth="1.5" />
          <circle cx="100" cy="135" r="2" fill="#8A1538" />
          <circle cx="100" cy="147" r="2" fill="#8A1538" />

          {/* Neck & Face */}
          <rect x="88" y="105" width="24" height="25" fill="url(#kidSkin)" rx="5" />
          <circle cx="100" cy="80" r="36" fill="url(#kidSkin)" />

          {/* Bright Cheerful Eyes */}
          <ellipse cx="86" cy="78" rx="6" ry="7" fill="#3D291D" />
          <ellipse cx="114" cy="78" rx="6" ry="7" fill="#3D291D" />
          <circle cx="88" cy="75" r="2.5" fill="#FFFFFF" />
          <circle cx="116" cy="75" r="2.5" fill="#FFFFFF" />

          {/* Cheeks Blush */}
          <ellipse cx="78" cy="88" rx="7" ry="4" fill="#FF9E9E" opacity="0.6" />
          <ellipse cx="122" cy="88" rx="7" ry="4" fill="#FF9E9E" opacity="0.6" />

          {/* Cute Nose & Big Happy Smile */}
          <circle cx="100" cy="85" r="2.5" fill="#D68E65" />
          <path d="M 88 94 Q 100 108 112 94" stroke="#8A1538" strokeWidth="3" fill="#8A1538" strokeLinecap="round" />
          {/* White teeth */}
          <path d="M 91 95 Q 100 99 109 95 Z" fill="#FFFFFF" />

          {/* Traditional Qatari Ghutra & Agal for young boy */}
          <path d="M 55 65 Q 60 25 100 25 Q 140 25 145 65 Q 155 120 150 170 Q 130 130 130 95 L 70 95 Q 70 130 50 170 Q 45 120 55 65 Z" fill="#FFFFFF" stroke="#E2D9C8" strokeWidth="2" />
          <ellipse cx="100" cy="38" rx="36" ry="10" fill="none" stroke="#1A1A1A" strokeWidth="7" />
          <ellipse cx="100" cy="34" rx="34" ry="8" fill="none" stroke="#333333" strokeWidth="5" />
          {/* Agal tail */}
          <path d="M 130 40 Q 140 85 138 130" stroke="#1A1A1A" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

// Visitor Character for Village Map Movement
export const VisitorCharacter: React.FC<{
  size?: number;
  isWalking?: boolean;
  className?: string;
}> = ({ size = 60, isWalking = false, className = '' }) => {
  return (
    <div className={`transition-transform duration-200 ${isWalking ? 'animate-bounce' : ''} ${className}`}>
      <VisitorAvatar size={size} showName={false} />
    </div>
  );
};

// Abu Rashid Dialogue Bubble
export const AbuRashidDialogue: React.FC<{
  message: string;
  onReplay?: () => void;
  className?: string;
}> = ({ message, onReplay, className = '' }) => {
  const handleSpeak = () => {
    audioEngine.speak(message);
    if (onReplay) onReplay();
  };

  return (
    <div className={`relative bg-[#F7F1E5] border-2 border-[#C7A15A] rounded-2xl p-4 shadow-xl text-[#513A2E] max-w-lg ${className}`}>
      {/* Dialogue triangle pointing right/left */}
      <div className="absolute -bottom-3 right-8 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-[#C7A15A]" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className="text-xs font-bold text-[#8A1538] block mb-1">مرشد التراث القطري - أبو راشد:</span>
          <p className="text-base md:text-lg font-bold leading-relaxed">{message}</p>
        </div>
        <button
          onClick={handleSpeak}
          title="إعادة الاستماع"
          className="p-2.5 rounded-full bg-[#8A1538] text-[#F7F1E5] hover:bg-[#690e29] active:scale-95 transition-all shadow-md flex items-center justify-center shrink-0"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
