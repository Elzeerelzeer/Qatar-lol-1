import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, RotateCcw, ImagePlus, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { audioEngine } from '../services/audioService';

interface StudioStationProps {
  onComplete: () => void;
  onBackToVillage: () => void;
}

export const StudioStation: React.FC<StudioStationProps> = ({ onComplete, onBackToVillage }) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Temporary in-memory object URL (No localStorage, No IndexedDB, No external upload!)
  const [capturedObjectUrl, setCapturedObjectUrl] = useState<string | null>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    audioEngine.setZone('studio');
    audioEngine.speak('أهلاً بك في استديو قطر لوّل! خصوصيتك تهمنا وأمانك أولويتنا.');

    // Cleanup when leaving studio
    return () => {
      cleanupCamera();
      cleanupObjectUrl();
    };
  }, []);

  const cleanupCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const cleanupObjectUrl = () => {
    if (capturedObjectUrl) {
      URL.revokeObjectURL(capturedObjectUrl);
      setCapturedObjectUrl(null);
    }
  };

  const handleOpenPrivacyModal = () => {
    setShowPrivacyModal(true);
  };

  const handleConfirmStartCamera = async () => {
    setShowPrivacyModal(false);
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('المتصفح الحالي لا يدعم فتح الكاميرا مباشرة.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
      audioEngine.playSuccess();
    } catch (err) {
      console.warn('Camera access denied or failed:', err);
      setCameraError('لم نتمكن من تشغيل الكاميرا المباشرة. يمكنك استخدام خيار «التقاط من كاميرا الجهاز».');
    }
  };

  // Merge image with Qatari Heritage Frame on Canvas & export as Blob Object URL
  const compositeWithHeritageFrame = (sourceElement: HTMLVideoElement | HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 800;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw Background
    ctx.fillStyle = '#F7F1E5';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw user photo in center arch
    ctx.save();
    // Rounded arch clipping
    ctx.beginPath();
    ctx.roundRect(80, 100, 640, 540, [180, 180, 24, 24]);
    ctx.clip();

    // Mirror video if user facing
    ctx.drawImage(sourceElement, 80, 100, 640, 540);
    ctx.restore();

    // 3. Draw Ornate Qatari Maroon & Gold Border
    ctx.strokeStyle = '#8A1538';
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    ctx.strokeStyle = '#C7A15A';
    ctx.lineWidth = 6;
    ctx.strokeRect(26, 26, width - 52, height - 52);

    // 4. Sadu Pattern Band at Top & Bottom
    ctx.fillStyle = '#8A1538';
    ctx.fillRect(32, 32, width - 64, 40);
    ctx.fillRect(32, height - 72, width - 64, 40);

    // 5. Header Title
    ctx.fillStyle = '#F7F1E5';
    ctx.font = 'bold 24px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('تذكار استديو قطر لوّل', width / 2, 60);

    // 6. Footer Caption
    ctx.font = 'bold 20px Cairo, sans-serif';
    ctx.fillText('من يعرف تراثه… يحفظ حكايته للأجيال', width / 2, height - 46);

    // 7. Stamp Emblem
    ctx.fillStyle = '#C7A15A';
    ctx.beginPath();
    ctx.arc(width - 80, height - 120, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8A1538';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#8A1538';
    ctx.font = 'bold 26px Cairo, sans-serif';
    ctx.fillText('📸 لوّل', width - 80, height - 112);

    // Convert Canvas to Blob & Object URL only
    canvas.toBlob((blob) => {
      if (blob) {
        cleanupObjectUrl();
        const url = URL.createObjectURL(blob);
        setCapturedObjectUrl(url);
        setShowCompletionDialog(true);
        audioEngine.playSuccess();
      }
    }, 'image/png');
  };

  const handleCaptureVideo = () => {
    if (!videoRef.current || !isCameraActive) return;
    compositeWithHeritageFrame(videoRef.current);
  };

  const handleDeviceCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const tempUrl = URL.createObjectURL(file);
    img.onload = () => {
      compositeWithHeritageFrame(img);
      URL.revokeObjectURL(tempUrl);
    };
    img.src = tempUrl;
  };

  // Re-take photo: Clears previous result, keeps camera open if running
  const handleRetake = () => {
    cleanupObjectUrl();
    setShowCompletionDialog(false);
  };

  // New photo: Stops camera, deletes original, deletes result, deletes blob, revokes object URL
  const handleNewPhoto = () => {
    cleanupCamera();
    cleanupObjectUrl();
    setShowCompletionDialog(false);
    setCameraError(null);
  };

  // Download locally to user's device, then clear temporary memory
  const handleSaveImage = () => {
    if (!capturedObjectUrl) return;

    const link = document.createElement('a');
    link.href = capturedObjectUrl;
    link.download = 'qatar-lawwal-photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up temporary photo
    setTimeout(() => {
      cleanupObjectUrl();
      onComplete();
    }, 500);
  };

  const handleCompleteWithoutSaving = () => {
    cleanupObjectUrl();
    cleanupCamera();
    onComplete();
  };

  return (
    <div className="min-h-[calc(100vh-56px)] w-full bg-gradient-to-b from-[#2e1913] via-[#43231b] to-[#1c0d09] p-3 md:p-6 text-[#F7F1E5] flex flex-col justify-between select-none">
      {/* Hidden File Input for Device Camera Capture */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="user"
        onChange={handleDeviceCameraCapture}
        className="hidden"
      />

      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-[#C7A15A]/60 pb-3 mb-3">
        <button
          onClick={() => {
            cleanupCamera();
            cleanupObjectUrl();
            onBackToVillage();
          }}
          className="px-3 py-1.5 rounded-xl bg-[#8A1538] text-[#F7F1E5] font-bold text-xs md:text-sm flex items-center gap-1.5 hover:bg-[#6b102b] transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى القرية</span>
        </button>

        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black text-[#F7F1E5] flex items-center justify-center gap-2">
            <span>استديو قطر لوّل</span>
            <span className="text-2xl">📸</span>
          </h2>
          <span className="text-xs md:text-sm font-bold text-[#D8C29D]">
            التقط صورتك التذكارية داخل إطار التراث القطري
          </span>
        </div>

        {/* Privacy Badge */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-400 text-xs font-bold text-emerald-300">
          <ShieldCheck className="w-4 h-4" />
          <span>خصوصية محلية 100%</span>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="max-w-4xl mx-auto w-full bg-[#F7F1E5] rounded-3xl border-4 border-[#C7A15A] p-4 md:p-6 text-[#513A2E] shadow-2xl my-auto">
        <div className="flex flex-col items-center">
          {/* Viewport Frame */}
          <div className="relative w-full max-w-lg aspect-square rounded-3xl border-4 border-[#8A1538] overflow-hidden bg-[#513A2E] shadow-2xl flex items-center justify-center">
            {capturedObjectUrl ? (
              <img
                src={capturedObjectUrl}
                alt="صورتك التذكارية"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="p-6 text-center text-[#F7F1E5] flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[#8A1538] border-2 border-[#C7A15A] flex items-center justify-center mb-3 shadow-lg">
                  <Camera className="w-10 h-10 text-amber-300" />
                </div>
                <h4 className="text-xl font-black mb-1">الكاميرا متوقفة</h4>
                <p className="text-xs md:text-sm text-[#D8C29D] max-w-xs leading-relaxed">
                  اضغط على «فتح الكاميرا» أو «التقاط من كاميرا الجهاز» لالتقاط صورتك التذكارية في أمان تام.
                </p>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="mt-3 p-3 rounded-xl bg-amber-100 border border-amber-400 text-amber-900 text-xs font-bold text-center max-w-lg">
              {cameraError}
            </div>
          )}

          {/* Action Buttons Toolbar as required */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-5 w-full max-w-xl">
            {/* Open Camera Button */}
            {!isCameraActive && !capturedObjectUrl && (
              <button
                onClick={handleOpenPrivacyModal}
                className="px-5 py-3 rounded-2xl bg-[#8A1538] text-[#F7F1E5] font-black text-sm md:text-base border-2 border-[#C7A15A] shadow-md flex items-center gap-2 hover:bg-[#6b102b] active:scale-95"
              >
                <Camera className="w-5 h-5 text-amber-300" />
                <span>فتح الكاميرا</span>
              </button>
            )}

            {/* Device Camera fallback */}
            {!capturedObjectUrl && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3 rounded-2xl bg-[#C7A15A] text-[#513A2E] font-black text-sm md:text-base border-2 border-white shadow-md flex items-center gap-2 hover:bg-[#d4b067] active:scale-95"
              >
                <ImagePlus className="w-5 h-5" />
                <span>التقاط من كاميرا الجهاز</span>
              </button>
            )}

            {/* Capture Photo Button (Enabled only when camera is active) */}
            {isCameraActive && !capturedObjectUrl && (
              <button
                onClick={handleCaptureVideo}
                className="px-8 py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-base md:text-lg border-2 border-white shadow-lg flex items-center gap-2 hover:bg-emerald-700 active:scale-95 animate-pulse"
              >
                <Camera className="w-6 h-6" />
                <span>التقاط الصورة</span>
              </button>
            )}

            {/* Retake & New Photo Buttons */}
            {capturedObjectUrl && (
              <>
                <button
                  onClick={handleRetake}
                  className="px-4 py-3 rounded-2xl bg-[#513A2E] text-white font-black text-sm border border-[#C7A15A] shadow flex items-center gap-1.5 hover:bg-[#3d291d] active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة التصوير</span>
                </button>
                <button
                  onClick={handleNewPhoto}
                  className="px-4 py-3 rounded-2xl bg-stone-600 text-white font-black text-sm border border-stone-400 shadow flex items-center gap-1.5 hover:bg-stone-700 active:scale-95"
                >
                  <span>صورة جديدة</span>
                </button>
                <button
                  onClick={handleSaveImage}
                  className="px-6 py-3 rounded-2xl bg-[#8A1538] text-white font-black text-sm md:text-base border-2 border-[#C7A15A] shadow-lg flex items-center gap-2 hover:bg-[#6b102b] active:scale-95"
                >
                  <Download className="w-5 h-5 text-amber-300" />
                  <span>حفظ الصورة</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 1. Mandatory Privacy Agreement Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#F7F1E5] rounded-3xl border-4 border-[#C7A15A] p-6 text-[#513A2E] text-center shadow-2xl animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#8A1538] text-amber-300 mx-auto flex items-center justify-center mb-3 shadow-md">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-[#8A1538] mb-2 font-['Cairo']">
              خصوصيتك تهمنا 🔒
            </h3>

            <p className="text-sm md:text-base font-bold leading-relaxed mb-6 bg-amber-100/60 p-4 rounded-2xl border border-[#C7A15A]/60 text-right text-[#513A2E]">
              تُستخدم الكاميرا لإنشاء صورتك داخل تجربة قطر لوّل فقط.
              <br /><br />
              لا يتم حفظ صورتك في الموقع أو رفعها إلى الإنترنت.
              <br /><br />
              بعد تنزيل الصورة أو مغادرة الصفحة يتم حذفها من الجلسة.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleConfirmStartCamera}
                className="flex-1 py-3.5 rounded-2xl bg-[#8A1538] text-white font-black text-base shadow-lg border-2 border-[#C7A15A] hover:bg-[#6b102b] active:scale-95"
              >
                السماح وفتح الكاميرا
              </button>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="py-3.5 px-6 rounded-2xl bg-stone-300 text-stone-800 font-black text-base hover:bg-stone-400 active:scale-95"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Mission Complete & Save/Skip Modal */}
      {showCompletionDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#F7F1E5] rounded-3xl border-4 border-[#C7A15A] p-6 text-[#513A2E] text-center shadow-2xl animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#C7A15A] to-[#F5D77F] border-4 border-[#8A1538] flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-4xl">📸</span>
            </div>

            <h3 className="text-3xl font-black text-[#8A1538] mb-1 font-['Cairo']">
              أكملت المهمة!
            </h3>
            <p className="text-sm font-bold text-[#513A2E]/90 mb-5">
              تم إنشاء صورتك التذكارية التراثية بنجاح.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSaveImage}
                className="w-full py-4 rounded-2xl bg-[#8A1538] text-white font-black text-base shadow-lg border-2 border-[#C7A15A] flex items-center justify-center gap-2 hover:bg-[#6b102b] active:scale-95"
              >
                <Download className="w-5 h-5 text-amber-300" />
                <span>حفظ الصورة وأكمل</span>
              </button>
              <button
                onClick={handleCompleteWithoutSaving}
                className="w-full py-3.5 rounded-2xl bg-[#D8C29D] text-[#513A2E] font-black text-sm hover:bg-[#cdb48b] active:scale-95"
              >
                أكمل بدون حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
