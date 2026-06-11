import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProgressBar, listingSteps } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { provinces } from '../../data/mockData';

export const ProductInfo: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productType = (location.state as any)?.productType || { name: 'Sản phẩm', icon: '📦' };
  const grade = (location.state as any)?.grade || 'Grade 1';

  const [form, setForm] = useState({
    productName: `Cà phê ${productType.name}`,
    quantity: '500',
    unit: 'kg',
    harvestDate: '2025-05-15',
    location: 'Gia Lai',
    packaging: 'Bao 50kg',
    availableDate: '2025-06-01',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.quantity || parseInt(form.quantity) <= 0) {
      newErrors.quantity = 'Vui lòng nhập số lượng có thể bán';
    }
    if (!form.harvestDate) {
      newErrors.harvestDate = 'Vui lòng chọn ngày thu hoạch';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      navigate('/farmer/create/price', {
        state: { productType, grade, productInfo: form }
      });
    }
  };

  const packagingOptions = ['Bao 50kg', 'Bao 30kg', 'Bao 60kg', 'Thùng 20kg', 'Túi 5kg', 'Theo yêu cầu'];

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/farmer/create/ai-result')} className="text-gray-500">←</button>
          <h1 className="text-lg font-bold text-gray-900">Thông tin sản phẩm</h1>
        </div>
      </div>
      <ProgressBar steps={listingSteps} currentStep={4} />

      <div className="px-4 space-y-4">
        <p className="text-sm text-gray-500">
          AI đã điền thông tin tự động. Vui lòng kiểm tra và xác nhận.
        </p>

        {/* Product Name */}
        <div>
          <label className="input-label">Tên sản phẩm *</label>
          <input
            type="text"
            value={form.productName}
            onChange={(e) => handleChange('productName', e.target.value)}
            className="input-field"
          />
        </div>

        {/* Grade (read only) */}
        <div>
          <label className="input-label">Grade</label>
          <div className="input-field bg-gray-50 text-gray-700 flex items-center">
            {grade}
          </div>
        </div>

        {/* Quantity & Unit */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="input-label">Số lượng *</label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              className={`input-field ${errors.quantity ? 'error' : ''}`}
              placeholder="Nhập số lượng"
            />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
          </div>
          <div>
            <label className="input-label">Đơn vị</label>
            <select
              value={form.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              className="input-field"
            >
              <option>kg</option>
              <option>tấn</option>
              <option>thùng</option>
              <option>bao</option>
            </select>
          </div>
        </div>

        {/* Harvest Date */}
        <div>
          <label className="input-label">Ngày thu hoạch *</label>
          <input
            type="date"
            value={form.harvestDate}
            onChange={(e) => handleChange('harvestDate', e.target.value)}
            className={`input-field ${errors.harvestDate ? 'error' : ''}`}
          />
          {errors.harvestDate && <p className="text-red-500 text-xs mt-1">{errors.harvestDate}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="input-label">Khu vực sản xuất</label>
          <select
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="input-field"
          >
            {provinces.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Packaging */}
        <div>
          <label className="input-label">Đóng gói</label>
          <div className="flex flex-wrap gap-2">
            {packagingOptions.map(opt => (
              <button
                key={opt}
                onClick={() => handleChange('packaging', opt)}
                className={`px-4 py-2 rounded-xl text-sm transition-all
                  ${form.packaging === opt
                    ? 'bg-primary-100 text-primary-700 border border-primary-200 font-medium'
                    : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Available Date */}
        <div>
          <label className="input-label">Ngày có thể giao</label>
          <input
            type="date"
            value={form.availableDate}
            onChange={(e) => handleChange('availableDate', e.target.value)}
            className="input-field"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="input-label">Ghi chú thêm</label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="input-field min-h-[80px] resize-none"
            placeholder="Ghi chú về chất lượng, giao hàng, v.v..."
          />
        </div>

        <Button onClick={handleContinue} variant="primary">
          Tiếp tục đến giá bán
        </Button>
      </div>
    </div>
  );
};
