import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProgressBar, listingSteps } from '../../components/ui/ProgressBar';

const analysisSteps = [
  'Kiểm tra ảnh',
  'Nhận diện sản phẩm',
  'Phân tích chất lượng',
  'Gợi ý grade',
];

export const AIAnalyzing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const productType = (location.state as any)?.productType || { name: 'Sản phẩm', icon: '📦' };
  const photoQuality = (location.state as any)?.photoQuality || 'good';

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnalysisStep((prev) => {
        if (prev >= analysisSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => setIsComplete(true), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        // Navigate to AI result - if photo was dark, use low confidence result
        navigate('/farmer/create/ai-result', {
          state: {
            productType,
            photoQuality,
            lowConfidence: photoQuality === 'dark'
          }
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isComplete, navigate, productType, photoQuality]);

  return (
    <div className="mobile-container min-h-screen bg-white flex flex-col">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/farmer/create/photo')} className="text-gray-500">←</button>
          <h1 className="text-lg font-bold text-gray-900">AI đang phân tích</h1>
        </div>
      </div>
      <ProgressBar steps={listingSteps} currentStep={2} />

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* AI Animation */}
        <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl animate-bounce">🤖</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          AI đang kiểm tra chất lượng sản phẩm...
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          Đang kiểm tra màu sắc, kích thước, lỗi nhìn thấy và cấp loại
        </p>

        {/* Analysis Steps */}
        <div className="w-full max-w-sm space-y-3">
          {analysisSteps.map((step, index) => {
            let status: 'pending' | 'active' | 'done' = 'pending';
            if (index < currentAnalysisStep) status = 'done';
            else if (index === currentAnalysisStep) status = 'active';

            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm
                  ${status === 'done' ? 'bg-green-500 text-white' :
                    status === 'active' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {status === 'done' ? '✓' : status === 'active' ? (
                    <div className="flex gap-0.5">
                      <span className="ai-dot" />
                      <span className="ai-dot" />
                      <span className="ai-dot" />
                    </div>
                  ) : index + 1}
                </div>
                <span className={`text-sm ${status === 'pending' ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Offline fallback */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200 w-full max-w-sm">
          <p className="text-xs text-yellow-700 text-center">
            ⚠️ Kết nối yếu. Listing sẽ được lưu nháp và tự phân tích khi có mạng.
          </p>
        </div>
      </div>

      {/* Loading dots at bottom */}
      <div className="pb-8 flex justify-center">
        <div className="flex gap-1">
          <span className="ai-dot" />
          <span className="ai-dot" />
          <span className="ai-dot" />
        </div>
      </div>
    </div>
  );
};
