import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProgressBar, listingSteps } from '../../components/ui/ProgressBar';

export const PhotoCapture: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [photoTaken, setPhotoTaken] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const productType = (location.state as any)?.productType || { name: 'Sản phẩm', icon: '📦' };

  const handleTakePhoto = () => {
    // Simulate taking a photo
    if (!flashOn) {
      setWarning('Ảnh hơi tối, vui lòng bật đèn hoặc ra nơi sáng hơn.');
    } else {
      setWarning(null);
    }
    setPhotoTaken(true);
  };

  const handleUsePhoto = () => {
    navigate('/farmer/create/analyzing', {
      state: { productType, photoQuality: flashOn ? 'good' : 'dark' }
    });
  };

  return (
    <div className="mobile-container min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 text-white z-10">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/farmer/create')} className="text-white/80">←</button>
          <h1 className="text-lg font-bold">Chụp ảnh sản phẩm</h1>
        </div>
      </div>

      {/* Camera Preview (simulated) */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="text-8xl opacity-30">{photoTaken ? '✅' : productType.icon}</div>

        {/* Camera frame overlay */}
        <div className="absolute inset-0 border-2 border-white/20 m-8 rounded-2xl">
          <div className="absolute top-4 left-4 right-4 text-center">
            <p className="text-white/80 text-sm bg-black/50 px-3 py-1.5 rounded-full inline-block">
              📷 Đặt sản phẩm trong khung. Chụp nơi đủ sáng.
            </p>
          </div>
        </div>

        {/* Sample image hint */}
        <div className="absolute top-20 right-4">
          <div className="bg-black/60 rounded-xl p-2 text-center">
            <p className="text-white/60 text-[10px] mb-1">Ảnh đúng</p>
            <div className="w-12 h-12 bg-green-900/40 rounded-lg flex items-center justify-center text-xl">
              ✅
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      {warning && (
        <div className="px-4 mb-2">
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-yellow-400/30">
            <p className="text-yellow-300 text-sm flex items-center gap-2">
              <span>⚠️</span> {warning}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="px-4 pb-8 pt-4 space-y-3">
        {photoTaken ? (
          <>
            <button onClick={handleUsePhoto} className="btn-primary bg-white !text-gray-900 font-bold">
              Dùng ảnh này ✓
            </button>
            <button onClick={() => setPhotoTaken(false)} className="btn-outline border-white/20 text-white w-full">
              Chụp lại
            </button>
          </>
        ) : (
          <>
            <button onClick={handleTakePhoto} className="btn-primary bg-white !text-gray-900 font-bold">
              <span className="text-2xl">📸</span> Chụp ảnh
            </button>
            <div className="flex gap-3">
              <button className="flex-1 btn-outline border-white/20 text-white !py-3">
                🖼️ Thư viện
              </button>
              <button
                onClick={() => setFlashOn(!flashOn)}
                className={`flex-1 btn-outline border-white/20 !py-3 ${flashOn ? 'bg-yellow-400/20 text-yellow-300' : 'text-white'}`}
              >
                {flashOn ? '💡 Bật' : '💡 Tắt'}
              </button>
            </div>
            <button className="w-full text-center text-white/50 text-sm py-2">📖 Xem hướng dẫn</button>
          </>
        )}
      </div>
    </div>
  );
};
