import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProgressBar, listingSteps } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { mockPriceSuggestion } from '../../data/mockData';

export const PriceSuggestionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productType = (location.state as any)?.productType || { name: 'Sản phẩm', icon: '📦' };
  const grade = (location.state as any)?.grade || 'Grade 1';
  const productInfo = (location.state as any)?.productInfo || {};
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [customPrice, setCustomPrice] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<'min' | 'recommended' | 'competitive' | 'custom'>('recommended');
  const [showWarning, setShowWarning] = useState(false);

  const price = mockPriceSuggestion;

  const getSelectedPriceValue = () => {
    switch (selectedPrice) {
      case 'min': return price.minSafePrice;
      case 'recommended': return price.recommendedPrice;
      case 'competitive': return price.competitivePrice;
      case 'custom': return parseInt(customPrice) || 0;
    }
  };

  const handleContinue = () => {
    const finalPrice = getSelectedPriceValue();
    const quantity = parseInt(productInfo.quantity || '500');

    navigate('/farmer/create/marketing', {
      state: {
        productType,
        grade,
        productInfo,
        price: {
          selectedPrice,
          finalPrice,
          suggestion: price
        },
        totalValue: finalPrice * quantity
      }
    });
  };

  const handleCustomPriceChange = (value: string) => {
    setCustomPrice(value);
    const numValue = parseInt(value);
    if (numValue && numValue < price.minSafePrice) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  const PriceOption = ({ type, label, value, profit, risk, note, color }: {
    type: 'min' | 'recommended' | 'competitive';
    label: string;
    value: number;
    profit: string;
    risk: string;
    note: string;
    color: string;
  }) => (
    <button
      onClick={() => { setSelectedPrice(type); setShowCustomInput(false); }}
      className={`w-full p-4 rounded-2xl border-2 text-left transition-all
        ${selectedPrice === type
          ? `${color} border-primary-500 shadow-sm`
          : 'border-gray-100 bg-white hover:border-gray-200'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-gray-900">{label}</p>
        {selectedPrice === type && <span className="text-primary-600 text-sm font-bold">✓ Đã chọn</span>}
      </div>
      <p className={`text-2xl font-bold ${type === 'recommended' ? 'text-primary-700' : 'text-gray-900'} mb-2`}>
        {value.toLocaleString()}đ/kg
      </p>
      <div className="flex items-center gap-4 text-xs">
        <span className="text-green-600">Lợi nhuận: {profit}</span>
        <span className={`${risk === 'Thấp' ? 'text-green-600' : risk === 'Cao' ? 'text-red-500' : 'text-yellow-600'}`}>
          Rủi ro: {risk}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{note}</p>
    </button>
  );

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/farmer/create/product-info')} className="text-gray-500">←</button>
          <h1 className="text-lg font-bold text-gray-900">Đề xuất giá bán</h1>
        </div>
      </div>
      <ProgressBar steps={listingSteps} currentStep={5} />

      <div className="px-4 space-y-3">
        <p className="text-sm text-gray-500">Dựa trên chất lượng sản phẩm và giá thị trường, AI đề xuất:</p>

        {/* 3 Price Options */}
        <PriceOption
          type="min"
          label="💰 Giá tối thiểu an toàn"
          value={price.minSafePrice}
          profit="0 đ/kg"
          risk="Thấp"
          note="Giá thấp nhất để không bị lỗ sau chi phí"
          color="bg-yellow-50/50"
        />

        <PriceOption
          type="recommended"
          label="⭐ Giá đề xuất"
          value={price.recommendedPrice}
          profit="~3.500 đ/kg"
          risk="Thấp"
          note="Giá cân bằng giữa cạnh tranh và lợi nhuận"
          color="bg-green-50/50"
        />

        <PriceOption
          type="competitive"
          label="🔥 Giá dễ bán"
          value={price.competitivePrice}
          profit="~1.500 đ/kg"
          risk="Trung bình"
          note="Giúp bán nhanh hơn nhưng lợi nhuận thấp hơn"
          color="bg-orange-50/50"
        />

        {/* Custom Price */}
        {!showCustomInput ? (
          <button
            onClick={() => { setShowCustomInput(true); setSelectedPrice('custom'); }}
            className="w-full py-3 text-center text-primary-600 font-medium text-sm border-2 border-dashed border-primary-200 rounded-2xl hover:bg-primary-50"
          >
            + Tự nhập giá
          </button>
        ) : (
          <div>
            <label className="input-label">Giá của bạn (đ/kg)</label>
            <input
              type="number"
              value={customPrice}
              onChange={(e) => handleCustomPriceChange(e.target.value)}
              className={`input-field ${showWarning ? 'border-yellow-400' : ''}`}
              placeholder="Nhập giá mong muốn"
            />
            {showWarning && (
              <p className="text-yellow-600 text-xs mt-1 flex items-center gap-1">
                ⚠️ Giá này có thể làm bạn không còn lợi nhuận sau chi phí. Bạn vẫn muốn tiếp tục?
              </p>
            )}
          </div>
        )}

        {/* Cost Breakdown */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex items-center justify-between text-sm text-gray-500 py-2"
        >
          <span>📊 Xem cách tính giá</span>
          <span>{showBreakdown ? '▲' : '▼'}</span>
        </button>

        {showBreakdown && (
          <Card>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Giá thị trường tham khảo</span>
                <span className="font-medium">{price.referenceMarketPrice.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Điều chỉnh theo chất lượng</span>
                <span className="font-medium text-red-500">{price.qualityAdjustment.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Chi phí vận chuyển</span>
                <span className="font-medium text-red-500">-{price.logisticsEstimate.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phí nền tảng</span>
                <span className="font-medium text-red-500">-{price.platformFee.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Thuế giả định</span>
                <span className="font-medium text-red-500">-{price.taxAssumption.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Risk buffer</span>
                <span className="font-medium text-red-500">-{price.riskBuffer.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold text-gray-900">Lợi nhuận mong muốn</span>
                <span className="font-bold text-green-600">+{price.desiredProfitMargin.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-primary-700">
                <span className="font-bold">Giá đề xuất</span>
                <span className="font-bold text-lg">{price.recommendedPrice.toLocaleString()}đ/kg</span>
              </div>
            </div>
          </Card>
        )}

        {/* Price Warning */}
        <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
          <p className="text-xs text-yellow-700 flex items-center gap-1">
            📌 Dữ liệu giá hôm nay chưa đủ. App đang dùng khoảng giá tham khảo gần nhất.
          </p>
        </div>

        <Button onClick={handleContinue} variant="primary">
          Tiếp tục tạo nội dung bán hàng
        </Button>

        <Button onClick={() => navigate('/farmer')} variant="ghost" className="w-full">
          Lưu nháp
        </Button>
      </div>
    </div>
  );
};
