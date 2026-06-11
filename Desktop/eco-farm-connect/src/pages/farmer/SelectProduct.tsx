import React from 'react';
import { useNavigate } from 'react-router-dom';
import { productTypes } from '../../data/mockData';
import { ProgressBar, listingSteps } from '../../components/ui/ProgressBar';

export const SelectProduct: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');

  const filtered = productTypes.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/farmer')} className="text-gray-500">←</button>
          <h1 className="text-lg font-bold text-gray-900">Tạo bài bán mới</h1>
        </div>
        <p className="text-sm text-gray-500 ml-9">Bước 1: Chọn loại nông sản</p>
      </div>
      <ProgressBar steps={listingSteps} currentStep={0} />

      <div className="px-4">
        <p className="text-title font-bold text-gray-900 mb-1">Bạn muốn bán sản phẩm gì?</p>
        <p className="text-sm text-gray-500 mb-4">Chọn loại nông sản để AI phân tích chính xác hơn</p>

        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field mb-4"
        />

        <div className="grid grid-cols-2 gap-3">
          {filtered.map((product) => (
            <button
              key={product.id}
              disabled={!product.supported}
              onClick={() => {
                if (product.supported) {
                  // Save selected product type and go to photo capture
                  navigate('/farmer/create/photo', { state: { productType: product } });
                }
              }}
              className={`p-5 rounded-2xl border-2 text-left transition-all
                ${product.supported
                  ? 'border-gray-100 bg-white active:scale-[0.98] active:border-primary-300 hover:border-primary-200'
                  : 'border-gray-100 bg-gray-50 opacity-60'}`}
            >
              <span className="text-3xl block mb-2">{product.icon}</span>
              <p className="font-semibold text-gray-900">{product.name}</p>
              {product.supported ? (
                <p className="text-xs text-green-600 mt-1">✓ AI hỗ trợ</p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Sắp hỗ trợ</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
