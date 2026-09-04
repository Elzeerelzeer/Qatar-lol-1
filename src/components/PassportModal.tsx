import React from 'react';
import { X, CheckCircle2, ArrowLeft, Star, Award } from 'lucide-react';
import { StationId } from '../types';

interface PassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedStationIds: StationId[];
  onGoToNextStation: (stationId: StationId) => void;
}

interface PassportStationItem {
  id: StationId;
  name: string;
  stamp: string;
  desc: string;
}

const PASSPORT_STATIONS: PassportStationItem[] = [
  { id: 'souq', name: 'سوق لوّل', stamp: '🏺', desc: 'اكتشاف مقتنيات السوق القطري القديم وتحدي القهوة' },
  { id: 'sea', name: 'بحر اللؤلؤ', stamp: '🌊', desc: 'رحلة الغوص على اللؤلؤ وجمع المحار في أعماق الخليج' },
  { id: 'nokhatha', name: 'رحلة النوخذة', stamp: '⛵', desc: 'قيادة المحمل القطري والتعرف على طاقم السفينة' },
  { id: 'majlis', name: 'مجلس لوّل', stamp: '☕', desc: 'أصول الضيافة القطرية بالدلة والفنجان والتمر' },
  { id: 'fereej', name: 'فريج الألعاب', stamp: '🪀', desc: 'الألعاب الشعبية القطرية كالتيلة والدحروي والصقلة' }
];

export const PassportModal: React.FC<PassportModalProps> = ({
  isOpen,
  onClose,
  completedStationIds,
  onGoToNextStation
}) => {
  if (!isOpen) return null;

  const educationalCompleted = PASSPORT_STATIONS.filter((s) => completedStationIds.includes(s.id));
  const completedCount = educationalCompleted.length;
  const nextStation = PASSPORT_STATIONS.find((s) => !completedStationIds.includes(s.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#F7F1E5] rounded-3xl border-4 border-[#C7A15A] shadow-2xl p-5 md:p-7 text-[#513A2E] overflow-hidden max-h-[90vh] flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b-2 border-[#C7A15A] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#8A1538] text-amber-300 flex items-center justify-center font-black text-xl border-2 border-[#C7A15A] shadow">
              📖
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-[#8A1538] font-['Cairo']">
                جواز قطر لوّل
              </h3>
              <span className="text-xs font-bold text-[#513A2E]/80">
                وثيقة إنجاز واستكشاف تراث قطر
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Overview Banner */}
        <div className="bg-[#8A1538] text-[#F7F1E5] p-4 rounded-2xl border-2 border-[#C7A15A] mb-4 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-full sadu-pattern opacity-15 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <Award className="w-8 h-8 text-amber-300" />
            <div>
              <span className="text-xs text-[#D8C29D] font-bold block">إنجاز المحطات التعليمية</span>
              <p className="text-lg md:text-xl font-black">
                أنجزت {completedCount} من 5 محطات
              </p>
            </div>
          </div>

          <div className="flex gap-1.5 relative z-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 border-[#F7F1E5] shadow-sm ${
                  i < completedCount ? 'bg-[#C7A15A]' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stations List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 mb-4">
          {PASSPORT_STATIONS.map((st) => {
            const isDone = completedStationIds.includes(st.id);

            return (
              <div
                key={st.id}
                className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-amber-50/90 border-[#C7A15A] shadow'
                    : 'bg-stone-100/80 border-stone-300 opacity-65'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Stamp Graphic */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 shadow-sm ${
                    isDone
                      ? 'bg-gradient-to-tr from-[#C7A15A] to-[#F5D77F] border-[#8A1538]'
                      : 'bg-stone-200 border-stone-400 grayscale'
                  }`}>
                    {st.stamp}
                  </div>

                  <div>
                    <h4 className="font-black text-sm md:text-base text-[#513A2E]">
                      {st.name}
                    </h4>
                    <p className="text-[11px] text-[#513A2E]/70 font-semibold leading-tight line-clamp-1">
                      {st.desc}
                    </p>
                  </div>
                </div>

                {isDone ? (
                  <div className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-xs font-black border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم الختم</span>
                  </div>
                ) : (
                  <span className="text-xs text-stone-500 font-bold bg-stone-200 px-3 py-1 rounded-full">
                    قيد الانتظار
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Suggested Next Station & Continue Action */}
        <div className="pt-2 border-t border-[#C7A15A]/60">
          {nextStation ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-right w-full sm:w-auto">
                <span className="text-xs font-bold text-[#8A1538] block">المحطة التالية المقترحة:</span>
                <span className="text-sm font-black text-[#513A2E]">
                  {nextStation.name} {nextStation.stamp}
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onGoToNextStation(nextStation.id);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#8A1538] text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-[#6b102b] shadow-lg border-2 border-[#C7A15A] active:scale-95"
              >
                <span>أكمل الرحلة</span>
                <ArrowLeft className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          ) : (
            <div className="text-center p-2 bg-emerald-100 text-emerald-900 rounded-xl font-black text-sm border border-emerald-400">
              🌟 مبروك! ختمت جميع المحطات الخمس التعليمية، والآن يمكنك فتح كنز قطر لوّل!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
