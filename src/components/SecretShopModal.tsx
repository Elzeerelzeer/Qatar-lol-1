import React from 'react';
import { Sparkles, Award, ArrowLeft, CheckCircle2, ShoppingBag } from 'lucide-react';
import { audioEngine } from '../services/audioService';

interface SecretShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueToVillage: () => void;
  onContinuePlaying: () => void;
  completedCount: number;
  totalToolsCount: number;
  lawwalCoins: number;
}

const SECRET_TREASURES = [
  {
    name: 'دانة قطر النادرة',
    icon: '🦪',
    desc: 'لؤلؤة دائرية لامعة وكاملة الاستدارة من أعمق هيرات الخليج.',
    tag: 'نادر جداً'
  },
  {
    name: 'دلة الضيافة الذهبية',
    icon: '🫖',
    desc: 'دلة شيوخ مصوغة من النحاس المطلي بالذهب الخالص.',
    tag: 'تحفة ملكية'
  },
  {
    name: 'البشت القطري المُزَرّى',
    icon: '👑',
    desc: 'بشت صوف فاخر مطرز بخيوط الزري الذهبي لأفخم المناسبات.',
    tag: 'رمز الأصالة'
  },
  {
    name: 'دهن العود واللبان المعتق',
    icon: '🪵',
    desc: 'أزكى أطياب التراث المحفوظة في قوارير بلورية أثرية.',
    tag: 'عطر الأجداد'
  }
];

export const SecretShopModal: React.FC<SecretShopModalProps> = ({
  isOpen,
  onClose,
  onContinueToVillage,
  onContinuePlaying,
  completedCount,
  totalToolsCount,
  lawwalCoins
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn" dir="rtl">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#FAF6EE] to-[#F2E7D5] rounded-3xl border-4 border-[#C7A15A] shadow-2xl p-5 sm:p-7 text-[#513A2E] relative overflow-hidden my-auto">
        {/* Decorative Golden Corner Sparks */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#8A1538]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header Ribbon */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#8A1538] text-amber-200 border border-[#C7A15A] shadow mb-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span className="text-xs font-black uppercase tracking-wider">مفاجأة مزاد سوق لوّل</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#8A1538] font-['Cairo'] flex items-center justify-center gap-2">
            <span>✨ فُتِحَ دكان سوق لوّل السري! ✨</span>
          </h2>
        </div>

        {/* Official Stamp & Badge */}
        <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-2 border-[#C7A15A] p-4 rounded-2xl shadow-inner text-center mb-4 relative">
          <div className="w-16 h-16 rounded-full bg-[#8A1538] text-amber-300 border-4 border-[#C7A15A] mx-auto flex items-center justify-center text-3xl shadow-lg mb-2">
            🏅
          </div>

          <div className="text-xs font-black text-[#8A1538] tracking-widest uppercase mb-1">
            وسام الإنجاز التراثي الرسمي
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#513A2E] mb-2 font-['Cairo']">
            «خبير أدوات سوق لوّل»
          </h3>

          {/* EXACT USER MANDATED MESSAGE */}
          <div className="bg-white/80 p-3 rounded-xl border border-amber-300/80 text-sm sm:text-base font-black text-[#8A1538] leading-relaxed shadow-sm">
            «أحسنت! اكتشفت مقتنيات السوق وأعدتها إلى أماكنها الصحيحة.»
          </div>

          <div className="mt-2 flex items-center justify-center gap-4 text-xs font-bold text-[#513A2E]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>الأدوات المنجزة: {completedCount}/{totalToolsCount}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>💰 نقود لوّل المكتسبة: {lawwalCoins}</span>
            </span>
          </div>
        </div>

        {/* Secret Shop Showcase */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-black text-[#8A1538] flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-[#8A1538]" />
              <span>معروضات الدكان السري النادرة (مكافأة الزيارة):</span>
            </h4>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              متاحة لك مجانًا
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {SECRET_TREASURES.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/90 p-3 rounded-xl border border-[#C7A15A]/70 shadow-sm flex flex-col items-center text-center hover:scale-102 transition"
              >
                <div className="text-3xl mb-1">{item.icon}</div>
                <div className="font-black text-xs text-[#8A1538] leading-tight mb-1">
                  {item.name}
                </div>
                <div className="text-[10px] text-stone-600 leading-tight">
                  {item.desc}
                </div>
                <span className="mt-2 text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full border border-amber-300">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#C7A15A]/40">
          <button
            onClick={() => {
              audioEngine.playSoftChime();
              onContinuePlaying();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#FAF6EE] hover:bg-amber-100 text-[#8A1538] font-black text-xs sm:text-sm border-2 border-[#8A1538] transition active:scale-95 shadow cursor-pointer text-center"
          >
            استكمال بقية أدوات المزاد ({totalToolsCount - completedCount} متبقية) 🔍
          </button>

          <button
            onClick={() => {
              audioEngine.playSuccess();
              onContinueToVillage();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8A1538] to-[#A01B42] hover:from-[#72112e] hover:to-[#8A1538] text-white font-black text-xs sm:text-sm border-2 border-[#C7A15A] transition active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>ختم الجواز والعودة للقرية التراثية</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
