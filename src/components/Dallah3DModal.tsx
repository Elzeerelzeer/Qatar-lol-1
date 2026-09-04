import React, { useState } from 'react';
import { X, Sparkles, Coffee, Info, Volume2, CheckCircle, ShieldCheck } from 'lucide-react';
import { Dallah3DViewer } from './Dallah3DViewer';
import { audioEngine } from '../services/audioService';

interface Dallah3DModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Dallah3DModal: React.FC<Dallah3DModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'3d' | 'etiquette' | 'parts'>('3d');
  const [hasPoured, setHasPoured] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePour = () => {
    setHasPoured(true);
  };

  const handlePlayVoice = () => {
    audioEngine.speak(
      'الدلة القطرية هي رمز الكرم والشهامة، تصنع من النحاس الأصفر والذهبي، وتقدم بها القهوة العربية المطيبة بالهيل والزعفران. وتمسك الدلة باليد اليسرى ويقدم الفنجان باليد اليمنى إكراماً للضيف.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#2E1A11] via-[#1A0E08] to-[#0D0603] rounded-3xl border-4 border-[#C7A15A] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#FAF6EE]">
        {/* Modal Top Header */}
        <div className="p-3.5 md:p-4 bg-gradient-to-r from-[#8A1538] via-[#65102a] to-[#8A1538] border-b-2 border-[#C7A15A] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C7A15A] text-[#513A2E] flex items-center justify-center text-xl shadow-md border border-white">
              🫖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-black text-amber-200">
                  مجسم الدلّة القطرية التفاعلي (3D)
                </h3>
                <span className="text-[10px] md:text-xs bg-amber-400 text-black px-2 py-0.5 rounded-full font-black shadow-xs">
                  نحاس الرسلان الذهبي
                </span>
              </div>
              <p className="text-[11px] md:text-xs text-amber-100/80 font-bold">
                حرّك المجسم 360°، اسحب للتكبير والتصغير، وجرّب صبّ القهوة العربية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayVoice}
              title="استمع إلى الشرح الصوتي عن الدلة"
              className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 border border-amber-400/50 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">صوت التراث</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body with 3D Viewer & Info */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 flex flex-col gap-4">
          {/* Main 3D Canvas Card */}
          <div className="w-full h-80 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden relative shadow-2xl border-2 border-[#C7A15A]/60">
            <Dallah3DViewer
              className="w-full h-full"
              autoRotateDefault={true}
              showControls={true}
              onPourCoffee={handlePour}
            />
          </div>

          {/* Educational Etiquette Cards (سلوم صب القهوة القطرية) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#FAF6EE] text-[#513A2E] p-3.5 rounded-2xl border-2 border-[#C7A15A] shadow-md flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#8A1538] text-amber-300 flex items-center justify-center shrink-0 text-base font-black">
                ١
              </div>
              <div>
                <h4 className="font-black text-sm text-[#8A1538]">مسك الدلة باليسار</h4>
                <p className="text-xs font-bold text-[#513A2E]/85 mt-0.5 leading-relaxed">
                  تُمسك الدلة باليد اليسرى من مقبضها العريض ويكون السبابة محاذياً للعروة للإحكام.
                </p>
              </div>
            </div>

            <div className="bg-[#FAF6EE] text-[#513A2E] p-3.5 rounded-2xl border-2 border-[#C7A15A] shadow-md flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#8A1538] text-amber-300 flex items-center justify-center shrink-0 text-base font-black">
                ٢
              </div>
              <div>
                <h4 className="font-black text-sm text-[#8A1538]">تقديم الفنجان باليمين</h4>
                <p className="text-xs font-bold text-[#513A2E]/85 mt-0.5 leading-relaxed">
                  يُمد الفنجان للضيف باليد اليمنى إكراماً وتوقيراً، مع ملء ثلث الفنجان فقط (صبّة الحشمة).
                </p>
              </div>
            </div>

            <div className="bg-[#FAF6EE] text-[#513A2E] p-3.5 rounded-2xl border-2 border-[#C7A15A] shadow-md flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#8A1538] text-amber-300 flex items-center justify-center shrink-0 text-base font-black">
                ٣
              </div>
              <div>
                <h4 className="font-black text-sm text-[#8A1538]">هز الفنجان عند الاكتفاء</h4>
                <p className="text-xs font-bold text-[#513A2E]/85 mt-0.5 leading-relaxed">
                  يهز الضيف فنجانه يميناً ويساراً كإشارة تراثية أنيقة تدل على الاكتفاء والشكر.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-black/60 border-t border-[#C7A15A]/40 flex items-center justify-between text-xs text-amber-200/80 px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-bold">تحفة تراثية ثلاثية الأبعاد مصممة لرحلة قطر لوّل</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#C7A15A] hover:bg-amber-400 text-[#513A2E] font-black transition-all cursor-pointer shadow-md"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
