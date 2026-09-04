import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, Sparkles, Maximize2 } from 'lucide-react';
import { audioEngine } from '../services/audioService';
import { StationModalWrapper } from './StationModalWrapper';
import { AbuRashidAvatar } from './Characters';
import { Dallah3DModal } from './Dallah3DModal';

interface MajlisStationProps {
  onComplete: () => void;
  onBackToVillage: () => void;
}

interface HospitalityItem {
  id: string;
  name: string;
  icon: string;
  isCorrect: boolean;
  desc: string;
  voiceover: string;
}

const ITEMS: HospitalityItem[] = [
  {
    id: 'dallah',
    name: 'الدلّة القطرية',
    icon: '🫖',
    isCorrect: true,
    desc: 'وعاء صب القهوة العربية الأصيلة مع الهيل والزعفران، تُمسك باليد اليسرى وتُصب باعتدال.',
    voiceover: 'أحسنت! الدلّة هي أساس ضيافة المجلس القطري العامر.'
  },
  {
    id: 'finjan',
    name: 'فنجان القهوة',
    icon: '☕',
    isCorrect: true,
    desc: 'الفنجان الصغير يُقدّم للضيف باليد اليمنى، وهز الفنجان يعني الاكتفاء من القهوة.',
    voiceover: 'ممتاز! يقدم الفنجان باليمين، وهزة الفنجان إشارة تراثية للاكتفاء.'
  },
  {
    id: 'dates',
    name: 'التمر القطري الفاخر (الخلاص)',
    icon: '🌴',
    isCorrect: true,
    desc: 'حلاوة الضيافة وصاحب القهوة الدائم؛ يُقدّم التمر في إناء المطبقية إكرامًا للزائر.',
    voiceover: 'أبدعت! التمر رفيق القهوة الدائم ورمز البركة وحسن الاستقبال.'
  },
  {
    id: 'anchor',
    name: 'المرساة (الباورة)',
    icon: '⚓',
    isCorrect: false,
    desc: 'أداة بحرية ثقيلة تُستخدم لتثبيت السفن في البحر، مكانها البحر وليس صينية الضيافة!',
    voiceover: 'المرساة أداة بحرية لتثبيت السفن، وليست من عناصر ضيافة المجلس.'
  },
  {
    id: 'net',
    name: 'شبكة الصيد (الغزل)',
    icon: '🕸️',
    isCorrect: false,
    desc: 'شباك صيد الأسماك والربيان مكانها على رمال الساحل أو متن المحمل.',
    voiceover: 'شبكة الصيد لأهل البحر وصيد السمك، وليست لضيافة المجلس!'
  }
];

export const MajlisStation: React.FC<MajlisStationProps> = ({ onComplete, onBackToVillage }) => {
  const [selectedCorrectIds, setSelectedCorrectIds] = useState<string[]>([]);
  const [activeFeedback, setActiveFeedback] = useState<string>('اختر عناصر الضيافة الثلاثة وضعها في صينية الضيافة.');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isDallah3DOpen, setIsDallah3DOpen] = useState<boolean>(false);

  useEffect(() => {
    audioEngine.setZone('majlis');
    audioEngine.speak('مرحبًا بكم في مجلس لوّل! مهمتك هي تجهيز ضيافة المجلس القطري الأصيل.');
  }, []);

  const handleSelectItem = (item: HospitalityItem) => {
    if (item.isCorrect) {
      if (!selectedCorrectIds.includes(item.id)) {
        const next = [...selectedCorrectIds, item.id];
        setSelectedCorrectIds(next);
        audioEngine.playCoffeePour();
        audioEngine.speak(item.voiceover);
        setActiveFeedback(`أحسنت! أضفت ${item.name} إلى صينية الضيافة.`);

        if (next.length === 3) {
          setTimeout(() => {
            setIsCompleted(true);
          }, 1400);
        }
      }
    } else {
      audioEngine.playError();
      audioEngine.speak(item.voiceover);
      setActiveFeedback(`تنبيه: ${item.desc}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] w-full bg-gradient-to-b from-[#6b1e2c] via-[#511320] to-[#2e0911] p-3 md:p-6 text-[#F7F1E5] flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-[#C7A15A]/60 pb-3 mb-3">
        <button
          onClick={onBackToVillage}
          className="px-3 py-1.5 rounded-xl bg-[#513A2E] text-[#F7F1E5] font-bold text-xs md:text-sm flex items-center gap-1.5 hover:bg-[#3D291D] transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للقرية</span>
        </button>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black text-[#F7F1E5] flex items-center justify-center gap-2">
            <span>مجلس لوّل</span>
            <span className="text-2xl">☕</span>
          </h2>
          <span className="text-xs md:text-sm font-bold text-[#D8C29D]">
            المهمة: «جهّز ضيافة المجلس» (اختر 3 عناصر صحيحة)
          </span>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-[#C7A15A] text-[#513A2E] font-black text-xs md:text-sm border-2 border-white shadow">
          المكتمل: {selectedCorrectIds.length} / 3
        </div>
      </div>

      {/* Main Majlis Stage */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto">
        {/* Left / Center: Traditional Qatari Hospitality Tray (صينية الضيافة الذهبية) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-md aspect-square rounded-full bg-gradient-to-br from-[#E2B755] via-[#C7A15A] to-[#8C6D33] border-8 border-[#F7F1E5] shadow-2xl p-6 flex flex-col items-center justify-center">
            {/* Tray Pattern Inlays */}
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-[#513A2E]/40 pointer-events-none" />

            <div className="text-center mb-2 z-10">
              <span className="text-xs font-black text-[#513A2E] uppercase tracking-wider block">
                صينية الضيافة القطرية
              </span>
              <span className="text-[11px] font-bold text-[#513A2E]/80">
                ضع هنا: الدلّة + الفنجان + التمر
              </span>
            </div>

            {/* Tray Items Placed */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-xs z-10">
              {/* Dallah Slot */}
              <button
                type="button"
                onClick={() => {
                  if (selectedCorrectIds.includes('dallah')) {
                    setIsDallah3DOpen(true);
                  }
                }}
                className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all ${
                  selectedCorrectIds.includes('dallah')
                    ? 'bg-white/95 border-[#8A1538] shadow-lg scale-105 cursor-pointer hover:ring-2 hover:ring-amber-400'
                    : 'bg-black/10 border-dashed border-[#513A2E]/60'
                }`}
                title={selectedCorrectIds.includes('dallah') ? 'اضغط لعرض مجسم الدلة 3D' : 'مكان الدلة'}
              >
                {selectedCorrectIds.includes('dallah') ? (
                  <>
                    <span className="text-4xl animate-pulse">🫖</span>
                    <span className="text-[10px] font-black text-[#8A1538] mt-1 flex items-center gap-0.5">
                      <span>الدلّة ✓</span>
                      <span className="bg-amber-400 text-black px-1 rounded text-[8px] font-bold">3D</span>
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-bold text-[#513A2E]/60">مكان الدلّة</span>
                )}
              </button>

              {/* Finjan Slot */}
              <div className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all ${
                selectedCorrectIds.includes('finjan')
                  ? 'bg-white/90 border-[#8A1538] shadow-lg scale-105'
                  : 'bg-black/10 border-dashed border-[#513A2E]/60'
              }`}>
                {selectedCorrectIds.includes('finjan') ? (
                  <>
                    <span className="text-4xl">☕</span>
                    <span className="text-[10px] font-black text-[#8A1538] mt-1">الفنجان ✓</span>
                  </>
                ) : (
                  <span className="text-xs font-bold text-[#513A2E]/60">مكان الفنجان</span>
                )}
              </div>

              {/* Dates Slot */}
              <div className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all ${
                selectedCorrectIds.includes('dates')
                  ? 'bg-white/90 border-[#8A1538] shadow-lg scale-105'
                  : 'bg-black/10 border-dashed border-[#513A2E]/60'
              }`}>
                {selectedCorrectIds.includes('dates') ? (
                  <>
                    <span className="text-4xl">🌴</span>
                    <span className="text-[10px] font-black text-[#8A1538] mt-1">التمر ✓</span>
                  </>
                ) : (
                  <span className="text-xs font-bold text-[#513A2E]/60">مكان التمر</span>
                )}
              </div>
            </div>

            {selectedCorrectIds.length === 3 && (
              <div className="mt-3 flex items-center gap-1 text-emerald-900 font-black text-xs bg-emerald-200/90 px-3 py-1 rounded-full border border-emerald-400 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>اكتملت صينية الضيافة على أصولها!</span>
              </div>
            )}

            {/* Quick 3D Dallah Inspection Button */}
            <button
              onClick={() => setIsDallah3DOpen(true)}
              className="mt-4 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-[#8A1538] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black text-xs md:text-sm border-2 border-amber-300 shadow-xl flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <span className="text-lg">🫖</span>
              <span>استعراض الدلّة القطرية مجسم 3D تفاعلي</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>

        {/* Right: Available items selection + Abu Rashid guide */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="bg-[#F7F1E5] p-4 rounded-3xl border-2 border-[#C7A15A] text-[#513A2E] shadow-xl">
            <h3 className="text-base font-black text-[#8A1538] mb-2">
              اضغط على العنصر لإضافته إلى الضيافة:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {ITEMS.map((item) => {
                const isSelected = selectedCorrectIds.includes(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    disabled={isSelected}
                    className={`p-3 rounded-2xl border-2 text-right transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 opacity-60 cursor-not-allowed'
                        : 'bg-white hover:bg-amber-50 border-[#C7A15A] hover:border-[#8A1538] shadow active:scale-98'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-[#D8C29D]/30 border border-[#C7A15A]/40">
                        {item.icon}
                      </span>
                      <div>
                        <span className="font-extrabold text-sm block text-[#513A2E]">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-[#513A2E]/70 font-semibold block line-clamp-1">
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="px-2 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" />
                        تم الوضع
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-[#8A1538] text-white text-[11px] font-bold">
                        اختر
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Guide Balloon */}
          <div className="bg-[#D8C29D]/30 p-3 rounded-2xl border border-[#C7A15A] flex items-center gap-3 text-white">
            <AbuRashidAvatar size={55} showName={false} />
            <p className="text-xs md:text-sm font-bold text-[#F7F1E5] leading-relaxed">
              {activeFeedback}
            </p>
          </div>
        </div>
      </div>

      {/* 3D Dallah Modal */}
      <Dallah3DModal
        isOpen={isDallah3DOpen}
        onClose={() => setIsDallah3DOpen(false)}
      />

      {/* Completion Modal */}
      <StationModalWrapper
        isOpen={isCompleted}
        stationName="مجلس لوّل"
        stamp="☕"
        subtitle="أحسنت صنعًا! أعددت صينية الضيافة القطرية بالدلة والفنجان والتمر وحصلت على ختم المجلس."
        onContinue={() => {
          setIsCompleted(false);
          onComplete();
        }}
      />
    </div>
  );
};
