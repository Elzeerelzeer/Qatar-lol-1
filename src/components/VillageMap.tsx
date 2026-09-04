import React, { useState, useEffect } from 'react';
import { Sparkles, Lock, CheckCircle, ArrowLeft, Info, HelpCircle, Compass, Trophy } from 'lucide-react';
import { StationId } from '../types';
import { audioEngine } from '../services/audioService';
import { AbuRashidAvatar, VisitorCharacter } from './Characters';
import { SaduBorder } from './HeritagePatterns';

interface VillageMapProps {
  completedStations: StationId[];
  onSelectStation: (stationId: StationId) => void;
  onOpenPassport: () => void;
}

interface StationCardInfo {
  id: StationId;
  name: string;
  icon: string;
  category: string;
  desc: string;
  soundZone: 'souq' | 'sea' | 'nokhatha' | 'majlis' | 'fereej' | 'studio';
  gridPos: { x: number; y: number }; // percentage on map
}

const STATIONS: StationCardInfo[] = [
  {
    id: 'souq',
    name: 'سوق لوّل',
    icon: '🏺',
    category: 'التجارة والحرف',
    desc: 'دكاكين العطارين والمقتنيات القديمة وتحدي دقة القهوة بالمنحاز.',
    soundZone: 'souq',
    gridPos: { x: 18, y: 32 }
  },
  {
    id: 'sea',
    name: 'بحر اللؤلؤ',
    icon: '🌊',
    category: 'مغاصات الهير',
    desc: 'غص في أعماق الخليج واجمع الدانات وتفادَ قناديل البحر.',
    soundZone: 'sea',
    gridPos: { x: 82, y: 30 }
  },
  {
    id: 'nokhatha',
    name: 'رحلة النوخذة',
    icon: '⛵',
    category: 'المحامل الشراعية',
    desc: 'قُد السفينة القطرية وتعرف على طاقم السيب والنهام والغواص.',
    soundZone: 'nokhatha',
    gridPos: { x: 82, y: 72 }
  },
  {
    id: 'majlis',
    name: 'مجلس لوّل',
    icon: '☕',
    category: 'الضيافة القطرية',
    desc: 'تعلم أصول الترحيب وإعداد صينية الضيافة بالدلة والفنجان والتمر.',
    soundZone: 'majlis',
    gridPos: { x: 18, y: 72 }
  },
  {
    id: 'fereej',
    name: 'فريج الألعاب',
    icon: '🪀',
    category: 'الألعاب الشعبية',
    desc: 'العب التيلة والدحروي والصقلة في سكيك الفريج القديم.',
    soundZone: 'fereej',
    gridPos: { x: 50, y: 22 }
  },
  {
    id: 'studio',
    name: 'استديو قطر لوّل',
    icon: '📸',
    category: 'تذكار الزيارة',
    desc: 'التقط صورتك التذكارية داخل إطار التراث القطري بأعلى خصوصية.',
    soundZone: 'studio',
    gridPos: { x: 50, y: 52 }
  },
  {
    id: 'treasure',
    name: 'كنز قطر لوّل',
    icon: '🎁',
    category: 'التتويج والشهادة',
    desc: 'صندوق المندوس الذهبي يُفتح بعد إنجاز المحطات الخمس التعليمية.',
    soundZone: 'none' as any,
    gridPos: { x: 50, y: 82 }
  }
];

export const VillageMap: React.FC<VillageMapProps> = ({
  completedStations,
  onSelectStation,
  onOpenPassport
}) => {
  // Automatically start calm traditional background music upon entering the village
  useEffect(() => {
    audioEngine.startHeritageBGM();
  }, []);

  // Visitor character coordinates on the map
  const [visitorCoords, setVisitorCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [targetStation, setTargetStation] = useState<StationCardInfo | null>(null);

  // List of 5 primary educational stations with stamps
  const educationalStationList: { id: StationId; name: string; icon: string }[] = [
    { id: 'souq', name: 'سوق لوّل', icon: '🏺' },
    { id: 'sea', name: 'بحر اللؤلؤ', icon: '🌊' },
    { id: 'nokhatha', name: 'رحلة النوخذة', icon: '⛵' },
    { id: 'majlis', name: 'مجلس لوّل', icon: '☕' },
    { id: 'fereej', name: 'فريج الألعاب', icon: '🪀' }
  ];

  const completedEducationalCount = educationalStationList.filter((s) =>
    completedStations.includes(s.id)
  ).length;
  const totalEducationalCount = educationalStationList.length;
  const progressPercent = Math.round((completedEducationalCount / totalEducationalCount) * 100);

  // Check 5 educational stations completion
  const educationalDone = ['souq', 'sea', 'nokhatha', 'majlis', 'fereej'].every((id) =>
    completedStations.includes(id as StationId)
  );

  // Abu Rashid Advice dynamic text
  const remainingCount = 5 - ['souq', 'sea', 'nokhatha', 'majlis', 'fereej'].filter((id) =>
    completedStations.includes(id as StationId)
  ).length;

  const guideText = educationalDone
    ? 'ما شاء الله عليك يا بطل! أتممت المحطات الخمس التعليمية، وبات كنز قطر لوّل مفتوحًا بانتظارك!'
    : remainingCount === 5
    ? 'حيّاك الله في قرية قطر لوّل! اختر أي محطة لنبدأ رحلتنا ونكتشف تراث الأجداد.'
    : `أحسنت المسير! تبقّت لك ${remainingCount} محطات لتكتمل أختام جوازك وتفتح كنز قطر لوّل.`;

  const handleStationClick = (station: StationCardInfo) => {
    // If treasure is clicked but not unlocked
    if (station.id === 'treasure' && !educationalDone) {
      audioEngine.playError();
      audioEngine.speak('كنز قطر لوّل لا يُفتح إلا بعد جمع الأختام الخمسة من المحطات التعليمية.');
      return;
    }

    // Play proximity audio for that zone
    audioEngine.setZone(station.soundZone);
    audioEngine.playMarbleClick();

    // Move visitor character towards target
    setTargetStation(station);
    setIsMoving(true);
    setVisitorCoords(station.gridPos);

    // Transition into station after movement
    setTimeout(() => {
      onSelectStation(station.id);
    }, 700);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#F7F1E5] p-3 md:p-6 text-[#513A2E] flex flex-col justify-between select-none relative overflow-hidden font-['Cairo',sans-serif]">
      {/* Background Plaster Ornament & Subtle Geometric Glow */}
      <div className="absolute inset-2 md:inset-6 border-[8px] md:border-[12px] border-[#D8C29D] opacity-35 plaster-border rounded-2xl pointer-events-none z-0" />
      <div className="absolute inset-0 pointer-events-none opacity-20 geometric-glow z-0" />

      {/* Decorative Sadu Border Header */}
      <div className="max-w-6xl mx-auto w-full z-10 mb-2">
        <SaduBorder />
      </div>

      {/* Heritage Stations Progress Bar (شريط تقدم المحطات في أعلى شاشة القرية) */}
      <div id="village-progress-bar" className="max-w-6xl mx-auto w-full z-10 mb-3">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border-3 border-[#C7A15A] shadow-xl p-3 md:p-4 text-[#513A2E] transition-all">
          {/* Top Progress Info Row */}
          <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-[#8A1538] text-amber-300 flex items-center justify-center font-bold text-base shadow border border-[#C7A15A] shrink-0">
                <Compass className="w-4 h-4 md:w-5 md:h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm md:text-base text-[#8A1538]">
                    شريط تقدم المحطات التراثية
                  </h3>
                  {educationalDone ? (
                    <span className="text-[10px] md:text-[11px] bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1 animate-pulse">
                      <CheckCircle className="w-3 h-3" />
                      <span>مكتمل 100% 🏆</span>
                    </span>
                  ) : (
                    <span className="text-[10px] md:text-[11px] bg-amber-100 text-[#8A1538] border border-amber-300/80 px-2 py-0.5 rounded-full font-bold">
                      {remainingCount === 1 ? 'متبقية محطة واحدة!' : `متبقية ${remainingCount} محطات`}
                    </span>
                  )}
                </div>
                <p className="text-[11px] md:text-xs text-[#513A2E]/80 font-bold mt-0.5">
                  أكمل المحطات الخمس لجمع أختام الجواز وفتح صندوق كنز قطر لوّل الذهبي
                </p>
              </div>
            </div>

            {/* Counter Badge (عدد المحطات المكتملة مقارنة بالعدد الكلي) */}
            <div className="flex items-center gap-2 bg-[#FAF6EE] px-3 md:px-4 py-1.5 rounded-xl border border-[#C7A15A] shadow-inner">
              <span className="text-xs md:text-sm font-bold text-[#513A2E]">
                المحطات المكتملة:
              </span>
              <div className="flex items-center gap-1 font-black">
                <span className="bg-[#8A1538] text-white px-2.5 py-0.5 rounded-lg text-sm md:text-base shadow-xs">
                  {completedEducationalCount}
                </span>
                <span className="text-xs md:text-sm text-[#513A2E]/60">
                  من
                </span>
                <span className="bg-[#513A2E] text-amber-300 px-2.5 py-0.5 rounded-lg text-sm md:text-base shadow-xs">
                  {totalEducationalCount}
                </span>
              </div>
              <span className="text-xs md:text-sm font-black text-[#8A1538] border-r-2 border-[#C7A15A]/40 pr-2">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Graphical Progress Bar Track */}
          <div className="relative w-full h-3.5 md:h-4 bg-[#EADCC0] rounded-full overflow-hidden border border-[#C7A15A]/60 shadow-inner my-2">
            <div
              className="h-full bg-gradient-to-l from-amber-300 via-[#C7A15A] to-[#8A1538] rounded-full transition-all duration-700 ease-out relative shadow-sm flex items-center justify-end pr-2"
              style={{ width: `${Math.max(progressPercent, 4)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
              {progressPercent >= 15 && (
                <span className="relative z-10 text-[9px] md:text-[10px] text-white font-black drop-shadow select-none">
                  {progressPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Interactive Station Milestone Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 md:gap-2 mt-2 pt-2 border-t border-[#C7A15A]/25">
            {educationalStationList.map((station) => {
              const isDone = completedStations.includes(station.id);
              return (
                <button
                  key={station.id}
                  onClick={() => onSelectStation(station.id)}
                  title={`انتقل إلى ${station.name} (${isDone ? 'مكتملة ومختومة ✓' : 'انقر للدخول'})`}
                  className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-1.5 border cursor-pointer active:scale-95 ${
                    isDone
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-400 shadow-xs'
                      : 'bg-[#FAF6EE] hover:bg-amber-100/70 text-[#513A2E] border-[#C7A15A]/50 hover:border-[#8A1538]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm shrink-0">{station.icon}</span>
                    <span className="truncate">{station.name}</span>
                  </div>
                  {isDone ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400/80 border border-amber-600/50 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Village Header & Abu Rashid speech banner with Geometric Balance styling */}
      <div className="max-w-6xl mx-auto w-full z-10">
        <div className="bg-[#8A1538] text-[#F7F1E5] rounded-3xl p-3 md:p-5 border-4 border-[#C7A15A] shadow-2xl flex items-center gap-3 md:gap-5 mb-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-full sadu-pattern opacity-10 pointer-events-none" />
          <div className="flex-shrink-0 relative z-10">
            <AbuRashidAvatar size={76} showName={false} />
          </div>
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-xs md:text-sm text-[#D8C29D]">
                المرشد التراثي - أبو راشد
              </span>
              <span className="text-[10px] bg-[#C7A15A] text-[#513A2E] px-2.5 py-0.5 rounded-full font-black shadow-sm">
                خريطة القرية التفاعلية
              </span>
            </div>
            <p className="text-sm md:text-base font-bold leading-relaxed">
              {guideText}
            </p>
          </div>

          <button
            onClick={onOpenPassport}
            className="hidden sm:flex px-4 py-2.5 rounded-2xl bg-[#C7A15A] hover:bg-[#d4b067] text-[#8A1538] font-black text-xs md:text-sm items-center gap-1.5 shadow-lg border-2 border-[#F7F1E5] transition active:scale-95 cursor-pointer shrink-0 relative z-10"
          >
            <span>📖 جواز قطر لوّل</span>
            <span className="bg-[#8A1538] text-white px-2 py-0.5 rounded-full text-[10px]">
              {completedStations.length}/5
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Village Ground Map Grid */}
      <div className="max-w-6xl mx-auto w-full flex-1 relative bg-[#FAF6EE] rounded-3xl border-4 border-[#C7A15A] shadow-2xl p-4 md:p-6 my-auto overflow-hidden z-10">
        {/* Subtle Map Elements: Sea on the right, Mud houses in middle, Souq on the left */}
        <div className="absolute right-0 inset-y-0 w-1/3 bg-gradient-to-l from-cyan-900/10 via-cyan-800/5 to-transparent pointer-events-none" />
        <div className="absolute left-0 inset-y-0 w-1/4 bg-gradient-to-r from-amber-900/10 via-amber-800/5 to-transparent pointer-events-none" />

        {/* Ambient Sea Boat silhouette watermark */}
        <div className="absolute top-6 right-6 opacity-20 pointer-events-none text-5xl">
          ⛵ 🌊
        </div>

        {/* Walking Visitor Avatar Marker */}
        <div
          className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out pointer-events-none"
          style={{ left: `${visitorCoords.x}%`, top: `${visitorCoords.y}%` }}
        >
          <div className="relative flex flex-col items-center">
            <VisitorCharacter size={50} isWalking={isMoving} />
            <div className="w-8 h-2 rounded-full bg-black/30 blur-[2px] mt-1" />
          </div>
        </div>

        {/* Village Stations Grid Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 relative z-20">
          {STATIONS.map((station) => {
            const isCompleted = completedStations.includes(station.id);
            const isTreasure = station.id === 'treasure';
            const isLocked = isTreasure && !educationalDone;

            return (
              <button
                key={station.id}
                onClick={() => handleStationClick(station)}
                className={`p-3 md:p-4 rounded-2xl border-2 text-right transition-all transform hover:scale-[1.02] active:scale-95 shadow-md flex flex-col justify-between relative overflow-hidden group ${
                  isTreasure
                    ? educationalDone
                      ? 'bg-gradient-to-tr from-[#8A1538] to-[#ab1c47] text-white border-amber-300 ring-4 ring-amber-300/50 animate-pulse'
                      : 'bg-stone-300/80 text-stone-600 border-stone-400 opacity-70'
                    : isCompleted
                    ? 'bg-amber-50/90 border-[#C7A15A] text-[#513A2E] ring-2 ring-[#C7A15A]'
                    : 'bg-white/90 border-[#D8C29D] text-[#513A2E] hover:border-[#8A1538]'
                }`}
              >
                {/* Station Top Details */}
                <div className="flex items-start justify-between w-full mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl p-2 rounded-2xl bg-[#D8C29D]/30 border border-[#C7A15A]/40 shadow-sm">
                      {station.icon}
                    </span>
                    <div>
                      <h4 className="font-black text-base md:text-lg">
                        {station.name}
                      </h4>
                      <span className="text-[11px] font-bold text-[#8A1538] block">
                        {station.category}
                      </span>
                    </div>
                  </div>

                  {/* Stamp / Lock Badge */}
                  <div>
                    {isLocked ? (
                      <span className="p-1.5 rounded-full bg-stone-400 text-stone-700 flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </span>
                    ) : isCompleted ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#C7A15A] text-[#513A2E] text-[10px] font-black flex items-center gap-0.5 shadow">
                        <CheckCircle className="w-3 h-3 text-[#8A1538]" />
                        مكتمل
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-[#8A1538] text-white text-[10px] font-black">
                        ابدأ
                      </span>
                    )}
                  </div>
                </div>

                {/* Station Brief Description */}
                <p className="text-xs font-semibold leading-relaxed opacity-90 line-clamp-2">
                  {station.desc}
                </p>

                {/* Proximity Sound Indicator Hint */}
                <div className="mt-2.5 pt-1.5 border-t border-[#C7A15A]/30 flex items-center justify-between text-[10px] font-bold">
                  <span className="opacity-75">
                    {isLocked ? '🔒 يُفتح بعد إكمال 5 محطات' : 'اضغط للانتقال للمحطة'}
                  </span>
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Passport Floating Button */}
      <div className="max-w-6xl mx-auto w-full flex justify-between items-center mt-3 z-10">
        <div className="text-xs font-bold text-[#513A2E]/80">
          📍 اختر أي محطة لتنتقل إليها شخصية الزائر وتستمتع بأجوائها التراثية الأصيلة.
        </div>

        <button
          onClick={onOpenPassport}
          className="sm:hidden px-4 py-2 rounded-xl bg-[#8A1538] text-[#F7F1E5] font-black text-xs flex items-center gap-1 shadow-lg border border-[#C7A15A]"
        >
          <span>📖 جواز قطر لوّل</span>
        </button>
      </div>

      {/* Bottom Status Bar matching Geometric Balance Theme */}
      <div className="max-w-6xl mx-auto w-full h-10 bg-[#FAF6EE] border-t-2 border-[#D8C29D] px-4 rounded-xl flex items-center justify-between text-xs text-[#513A2E] font-bold mt-2 z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>الصوت التفاعلي يعمل</span>
          </span>
          <span className="hidden sm:inline text-[#8A1538]">
            الأختام المكتملة: {completedStations.length} من 5
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>📍 قرية قطر لوّل التراثية</span>
          <span className="hidden sm:inline">⏱️ جولة استكشافية</span>
        </div>
      </div>
    </div>
  );
};
