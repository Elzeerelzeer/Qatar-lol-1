import React, { useRef } from 'react';
import { X, Download, Award, Shield } from 'lucide-react';
import { audioEngine } from '../services/audioService';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const handleDownloadCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // 1. Background Ivory & Sand Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#FDFBF7');
    bgGrad.addColorStop(0.5, '#F7F1E5');
    bgGrad.addColorStop(1, '#EDE0CB');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Ornate Maroon & Gold Borders
    ctx.strokeStyle = '#8A1538';
    ctx.lineWidth = 24;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.strokeStyle = '#C7A15A';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // 3. Header Emblem & Title
    ctx.fillStyle = '#8A1538';
    ctx.font = 'bold 32px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('تـجـربـة قـطـر لـوّل التـراثـيـة', width / 2, 110);

    ctx.fillStyle = '#C7A15A';
    ctx.font = 'bold 54px Cairo, sans-serif';
    ctx.fillText('شـهـادة حـارس تـراث قـطـر', width / 2, 180);

    // 4. Subtle line
    ctx.strokeStyle = '#C7A15A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 250, 210);
    ctx.lineTo(width / 2 + 250, 210);
    ctx.stroke();

    // 5. Certification Body Text
    ctx.fillStyle = '#513A2E';
    ctx.font = 'bold 26px Cairo, sans-serif';
    ctx.fillText('تشهد «قطر لوّل» بأن الزائر البطل قد اجتاز بنجاح كافة محطات القرية التراثية', width / 2, 280);
    ctx.fillText('واستكشف أسرار الغوص والمجلس والسوق والمحامل والألعاب الشعبية، وتُوّج بلقب:', width / 2, 330);

    // 6. Big Title Badge
    ctx.fillStyle = '#8A1538';
    ctx.font = 'black 50px Cairo, sans-serif';
    ctx.fillText('🏆 حارس تراث قطر 🏆', width / 2, 420);

    // 7. Five Stamps Row
    const stamps = [
      { stamp: '🏺', name: 'سوق لوّل' },
      { stamp: '🌊', name: 'بحر اللؤلؤ' },
      { stamp: '⛵', name: 'رحلة النوخذة' },
      { stamp: '☕', name: 'مجلس لوّل' },
      { stamp: '🪀', name: 'فريج الألعاب' }
    ];

    const startX = width / 2 - 320;
    stamps.forEach((item, idx) => {
      const cx = startX + idx * 160;
      const cy = 520;

      // Golden Stamp Circle
      ctx.fillStyle = '#C7A15A';
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8A1538';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.font = '36px Cairo, sans-serif';
      ctx.fillText(item.stamp, cx, cy + 12);

      ctx.fillStyle = '#513A2E';
      ctx.font = 'bold 16px Cairo, sans-serif';
      ctx.fillText(item.name, cx, cy + 62);
    });

    // 8. Heritage Quote Banner
    ctx.fillStyle = '#8A1538';
    ctx.fillRect(150, 630, width - 300, 60);

    ctx.fillStyle = '#F7F1E5';
    ctx.font = 'bold 24px Amiri, serif';
    ctx.fillText('«من يعرف تراثه… يحفظ حكايته للأجيال.»', width / 2, 668);

    // 9. Download file locally
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'qatar-lawwal-certificate.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        audioEngine.playSuccess();
      }
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
      {/* Hidden Canvas for High Res Rendering */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative w-full max-w-2xl bg-[#F7F1E5] rounded-3xl border-4 border-[#C7A15A] shadow-2xl p-6 md:p-8 text-[#513A2E] text-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Preview Card */}
        <div className="p-6 rounded-2xl border-4 border-[#8A1538] bg-gradient-to-b from-[#FDFBF7] to-[#EDE0CB] shadow-inner mb-6 relative">
          <div className="w-16 h-16 rounded-full bg-[#C7A15A] text-[#8A1538] flex items-center justify-center mx-auto mb-2 border-2 border-[#8A1538] shadow">
            <Award className="w-9 h-9" />
          </div>

          <h3 className="text-xl md:text-2xl font-black text-[#8A1538] mb-1 font-['Cairo']">
            شهادة حارس تراث قطر
          </h3>
          <p className="text-xs text-[#513A2E]/80 font-bold mb-4">
            تُمنح هذه الشهادة الفخرية لإتمام رحلة استكشاف تراث قطر عبر الأختام الخمسة
          </p>

          <div className="my-4 py-3 px-4 rounded-xl bg-[#8A1538] text-amber-300 font-black text-xl md:text-2xl shadow">
            🏆 حارس تراث قطر 🏆
          </div>

          {/* 5 Stamps Row */}
          <div className="flex justify-center items-center gap-3 my-4">
            {['🏺', '🌊', '⛵', '☕', '🪀'].map((st, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-xl bg-[#C7A15A] border-2 border-[#8A1538] flex items-center justify-center text-2xl shadow"
              >
                {st}
              </div>
            ))}
          </div>

          <p className="text-sm md:text-base font-bold text-[#8A1538] italic font-['Amiri'] mt-3">
            «من يعرف تراثه… يحفظ حكايته للأجيال.»
          </p>
        </div>

        {/* Save Certificate Button */}
        <button
          onClick={handleDownloadCertificate}
          className="w-full py-4 rounded-2xl bg-[#8A1538] text-white font-black text-lg md:text-xl shadow-xl border-2 border-[#C7A15A] flex items-center justify-center gap-2 hover:bg-[#6b102b] active:scale-95 transition"
        >
          <Download className="w-6 h-6 text-amber-300" />
          <span>حفظ بطاقة الإنجاز (PNG)</span>
        </button>
      </div>
    </div>
  );
};
