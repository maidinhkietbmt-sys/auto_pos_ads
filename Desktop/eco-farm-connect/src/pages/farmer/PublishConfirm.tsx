import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const shareChannels = [
  { id: 'marketplace', label: 'Marketplace Eco-Farm Connect', icon: '🌿', available: true },
  { id: 'facebook', label: 'Chia sẻ Facebook', icon: '📘', available: false },
  { id: 'zalo', label: 'Chia sẻ Zalo', icon: '💬', available: false },
  { id: 'copy', label: 'Sao chép nội dung', icon: '📋', available: true },
  { id: 'image', label: 'Tạo ảnh bài đăng', icon: '🖼️', available: true },
  { id: 'direct', label: 'Gửi trực tiếp cho người mua', icon: '✉️', available: true },
];

export const PublishConfirm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [published, setPublished] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['marketplace']);
  const price = (location.state as any)?.price || {};
  const productInfo = (location.state as any)?.productInfo || {};
  const productType = (location.state as any)?.productType || { name: 'Sản phẩm', icon: '📦' };

  const toggleChannel = (id: string) => {
    setSelectedChannels(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handlePublish = () => {
    setPublished(true);
  };

  if (published) {
    return (
      <div className="mobile-container min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-5xl">🎉</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Bài bán đã được tạo thành công!</h1>
          <p className="text-gray-500 text-center text-sm mb-2">
            {productType.name} - {productInfo.quantity}kg đã sẵn sàng để người mua tìm thấy.
          </p>
          <div className="bg-green-50 rounded-xl px-4 py-2 mb-8">
            <p className="text-xs text-green-700">Mã listing: EFL-{Date.now().toString(36).toUpperCase()}</p>
          </div>

          <div className="space-y-3 w-full">
            <Button onClick={() => navigate('/farmer/products')} variant="primary">
              📦 Xem bài bán
            </Button>
            <Button variant="secondary">
              📤 Chia sẻ ngay
            </Button>
            <Button onClick={() => navigate('/farmer/create')} variant="secondary">
              + Tạo bài bán khác
            </Button>
            <Button onClick={() => navigate('/farmer')} variant="ghost" className="w-full">
              ← Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/farmer/create/marketing')} className="text-gray-500">←</button>
          <h1 className="text-lg font-bold text-gray-900">Đăng bán</h1>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-4">
        {/* Summary Card */}
        <Card>
          <p className="text-sm font-medium text-gray-900 mb-3">Tóm tắt bài bán</p>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-3xl">
              {productType.icon}
            </div>
            <div>
              <p className="font-bold text-gray-900">{productType.name}</p>
              <p className="text-sm text-gray-500">{productInfo.quantity} {productInfo.unit} · {productInfo.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="green">{price.finalPrice?.toLocaleString()}đ/kg</Badge>
            <Badge variant="blue">{productInfo.packaging}</Badge>
          </div>
        </Card>

        {/* Channel Selection */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Chọn kênh đăng/chia sẻ:</p>
          <div className="space-y-2">
            {shareChannels.map(channel => (
              <button
                key={channel.id}
                onClick={() => channel.available && toggleChannel(channel.id)}
                disabled={!channel.available}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all
                  ${!channel.available
                    ? 'border-gray-100 bg-gray-50 opacity-50'
                    : selectedChannels.includes(channel.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 bg-white hover:border-gray-200'}`}
              >
                <span className="text-2xl">{channel.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{channel.label}</p>
                  {!channel.available && <p className="text-xs text-gray-400">Sắp tích hợp</p>}
                </div>
                {selectedChannels.includes(channel.id) && (
                  <span className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-xs text-blue-700">
            📌 Đối với MVP, bài đăng sẽ hiển thị trong Marketplace Eco-Farm Connect. 
            Tính năng đăng tự động lên Facebook, Zalo sẽ được tích hợp sau.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Button onClick={handlePublish} variant="primary" className="text-lg">
            🚀 Đăng bán
          </Button>
          <Button variant="outline">
            Lưu nháp
          </Button>
        </div>
      </div>
    </div>
  );
};
