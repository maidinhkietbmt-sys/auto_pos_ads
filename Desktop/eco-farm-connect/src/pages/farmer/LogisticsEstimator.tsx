import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { provinces } from '../../data/mockData';
import type { LogisticsEstimate } from '../../types';

const mockEstimate: LogisticsEstimate = {
  cost: 3000,
  estimatedDays: '3-5 ngày',
  costRatio: 6.5,
  warnings: [
    'Chi phí giao hàng đang chiếm 6.5% giá trị đơn hàng',
    'Với đơn hàng dưới 100kg, nên gom đơn với người mua khác',
  ],
  options: ['direct', 'pickup_point', 'buyer_pickup'],
};

export const LogisticsEstimator: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    sellerLocation: 'Gia Lai',
    buyerLocation: '',
    quantity: '500',
    fragility: 'low',
    deliveryMethod: 'direct',
  });
  const [showResult, setShowResult] = useState(false);

  const handleCalculate = () => {
    setShowResult(true);
  };

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">←</button>
        <h1 className="text-lg font-bold text-gray-900">Ước tính giao hàng</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <Card>
          <div className="space-y-3">
            <div>
              <label className="input-label">Vị trí người bán</label>
              <input type="text" value={form.sellerLocation} className="input-field bg-gray-50" readOnly />
            </div>
            <div>
              <label className="input-label">Vị trí người mua *</label>
              <select
                value={form.buyerLocation}
                onChange={(e) => setForm(p => ({ ...p, buyerLocation: e.target.value }))}
                className="input-field"
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinces.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Khối lượng (kg)</label>
              <input type="number" value={form.quantity} onChange={(e) => setForm(p => ({ ...p, quantity: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="input-label">Độ dễ hư hỏng</label>
              <div className="flex gap-2">
                {[
                  { id: 'low', label: 'Thấp' },
                  { id: 'medium', label: 'Trung bình' },
                  { id: 'high', label: 'Cao' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setForm(p => ({ ...p, fragility: opt.id }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm transition-all
                      ${form.fragility === opt.id ? 'bg-primary-100 text-primary-700 border border-primary-200' : 'bg-white text-gray-600 border border-gray-200'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCalculate} variant="primary">
              Tính chi phí giao hàng
            </Button>
          </div>
        </Card>

        {showResult && (
          <>
            <Card className="border-2 border-primary-200 bg-primary-50/50">
              <p className="font-bold text-gray-900 mb-4">📊 Kết quả ước tính</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Chi phí giao hàng</span>
                  <span className="text-2xl font-bold text-primary-700">{mockEstimate.cost.toLocaleString()}đ/kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Thời gian giao dự kiến</span>
                  <span className="font-medium text-gray-900">{mockEstimate.estimatedDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tỷ lệ so với giá trị đơn</span>
                  <span className="font-medium text-yellow-600">{mockEstimate.costRatio}%</span>
                </div>
              </div>
            </Card>

            {/* Warnings */}
            <div className="space-y-2">
              {mockEstimate.warnings.map((w, i) => (
                <div key={i} className="bg-yellow-50 rounded-xl px-4 py-3 border border-yellow-200 flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">⚠️</span>
                  <p className="text-xs text-yellow-700">{w}</p>
                </div>
              ))}
            </div>

            {/* Delivery Options */}
            <Card>
              <p className="text-sm font-bold text-gray-900 mb-3">Tùy chọn giao hàng</p>
              <div className="space-y-2">
                {[
                  { id: 'direct', label: 'Giao trực tiếp', desc: 'Vận chuyển từ nơi sản xuất đến người mua' },
                  { id: 'pickup_point', label: 'Giao qua điểm gom', desc: 'Giao đến điểm tập kết gần nhất' },
                  { id: 'buyer_pickup', label: 'Người mua tự nhận', desc: 'Người mua đến tận nơi lấy hàng' },
                ].map(opt => (
                  <label key={opt.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 cursor-pointer">
                    <input type="radio" name="delivery" defaultChecked={opt.id === 'direct'} className="text-primary-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
