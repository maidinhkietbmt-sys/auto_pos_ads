import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProgressBar, listingSteps } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { ConfidenceBadge, Badge } from '../../components/ui/Badge';
import { mockAIAnalysis, mockAIAnalysisLow } from '../../data/mockData';

export const AIResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productType = (location.state as any)?.productType || { name: 'Sản phẩm', icon: '📦' };
  const lowConfidence = (location.state as any)?.lowConfidence || false;

  const analysis = lowConfidence ? mockAIAnalysisLow : mockAIAnalysis;
  const [selectedGrade, setSelectedGrade] = useState(analysis.grade);
  const [showCorrectionReason, setShowCorrectionReason] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');

  const handleContinue = () => {
    navigate('/farmer/create/product-info', {
      state: { productType, grade: selectedGrade, analysis }
    });
  };

  const handleEditGrade = () => {
    setShowCorrectionReason(true);
  };

  const grades: Array<'Premium' | 'Grade 1' | 'Grade 2' | 'Grade 3'> = ['Premium', 'Grade 1', 'Grade 2', 'Grade 3'];

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/farmer/create/analyzing')} className="text-gray-500">←</button>
          <h1 className="text-lg font-bold text-gray-900">Kết quả phân tích AI</h1>
        </div>
      </div>
      <ProgressBar steps={listingSteps} currentStep={3} />

      <div className="px-4 space-y-4">
        {/* Product Image Card */}
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center text-4xl">
              {productType.icon}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{productType.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date().toLocaleDateString('vi-VN', { 
                  hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* AI Grade Result */}
        <div className="card border-2 border-primary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Kết quả AI</h3>
            <ConfidenceBadge score={analysis.confidenceScore} />
          </div>

          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-primary-700 mb-1">{selectedGrade}</p>
            <p className="text-sm text-gray-500">Grade đề xuất</p>
          </div>

          {/* Grade selector */}
          <div className="flex gap-2 justify-center mb-4">
            {grades.map((g) => (
              <button
                key={g}
                onClick={() => { setSelectedGrade(g); setShowCorrectionReason(true); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${selectedGrade === g 
                    ? 'bg-primary-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Quality Notes */}
          <div className="space-y-2">
            {analysis.qualityNotes.map((note, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{note.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{note.value}</span>
                  <span className={`text-sm ${
                    note.status === 'good' ? 'text-green-500' :
                    note.status === 'average' ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {note.status === 'good' ? '✓' : note.status === 'average' ? '△' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Confidence Warning */}
        {analysis.confidenceScore < 60 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold text-red-800 text-sm">AI chưa chắc chắn về kết quả này</p>
                <p className="text-xs text-red-600 mt-1">
                  Bạn nên kiểm tra lại hoặc gửi admin xác nhận trước khi đăng bán.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Correction Reason Modal */}
        {showCorrectionReason && (
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Lý do chỉnh sửa grade:</p>
            <div className="space-y-2">
              {['AI nhận sai chất lượng', 'Ảnh không rõ', 'Sản phẩm trộn nhiều loại', 'Khác'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setCorrectionReason(reason)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all
                    ${correctionReason === reason 
                      ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                      : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleContinue} variant="primary">
            Đồng ý và tiếp tục
          </Button>
          <Button onClick={() => navigate('/farmer/create/photo')} variant="secondary">
            Chụp lại ảnh
          </Button>
          <Button variant="ghost" className="w-full">
            Gửi admin kiểm tra
          </Button>
        </div>
      </div>
    </div>
  );
};
