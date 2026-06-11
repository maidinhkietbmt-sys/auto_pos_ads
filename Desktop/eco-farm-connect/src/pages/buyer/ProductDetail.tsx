import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockListings, mockFarmer } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Badge, ConfidenceBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const BuyerProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ quantity: '', location: '', message: '' });

  const listing = mockListings.find(l => l.id === productId) || mockListings[0];

  const [inquirySent, setInquirySent] = useState(false);

  const handleSendInquiry = () => {
    if (!inquiryForm.quantity) {
      alert('Vui lòng nhập số lượng muốn mua');
      return;
    }
    setInquirySent(true);
    setTimeout(() => {
      navigate(`/buyer`, { state: { inquirySent: true } });
    }, 1500);
  };

  if (inquirySent) {
    return (
      <div className="mobile-container min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Yêu cầu đã được gửi!</h2>
          <p className="text-sm text-gray-500 mb-6">Người bán sẽ phản hồi trong thời gian sớm nhất</p>
          <button onClick={() => navigate('/buyer')} className="btn-primary max-w-[200px] mx-auto">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">←</button>
        <h1 className="text-lg font-bold text-gray-900">Chi tiết sản phẩm</h1>
      </div>

      {/* Image */}
      <div className="bg-gradient-to-br from-primary-100 to-green-100 h-52 flex items-center justify-center">
        <span className="text-8xl">{listing.images[0]}</span>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Main Info Card */}
        <Card>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{listing.productName}</h2>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="green">{listing.grade}</Badge>
                <ConfidenceBadge score={82} />
                <Badge variant="gray">AI-graded</Badge>
              </div>
              <p className="text-2xl font-bold text-primary-700 mb-2">
                {listing.price.toLocaleString()}đ/{listing.unit}
              </p>
              <p className="text-sm text-gray-500">📍 {listing.location}</p>
            </div>
            <button className="text-2xl text-gray-300 hover:text-red-400 transition-colors">
              🤍
            </button>
          </div>
          <p className="text-sm text-gray-500">Số lượng còn: <span className="font-medium text-gray-900">{listing.quantity} {listing.unit}</span></p>
        </Card>

        {/* Quality Notes */}
        <Card>
          <p className="text-sm font-bold text-gray-900 mb-3">📋 Ghi chú chất lượng</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Màu sắc', value: 'Tốt', status: 'good' },
              { label: 'Kích thước', value: 'Đồng đều', status: 'good' },
              { label: 'Lỗi nhìn thấy', value: 'Ít', status: 'good' },
              { label: 'Tạp chất', value: 'Không có', status: 'good' },
            ].map((note, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  note.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <p className="text-xs text-gray-400">{note.label}</p>
                  <p className="text-sm font-medium text-gray-900">{note.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-yellow-50 rounded-xl">
            <p className="text-[10px] text-yellow-700">
              ℹ️ Thông tin này do AI đề xuất. Người bán đã xác nhận.
            </p>
          </div>
        </Card>

        {/* Product Info */}
        <Card>
          <p className="text-sm font-bold text-gray-900 mb-3">📝 Thông tin sản phẩm</p>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Đóng gói', value: listing.packaging || 'Bao 50kg' },
              { label: 'Ngày thu hoạch', value: new Date(listing.harvestDate).toLocaleDateString('vi-VN') },
              { label: 'Có thể giao từ', value: listing.availableDate ? new Date(listing.availableDate).toLocaleDateString('vi-VN') : 'Liên hệ' },
            ].map((info, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-gray-500">{info.label}</span>
                <span className="font-medium text-gray-900">{info.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Farmer Profile Card */}
        <Card onClick={() => navigate(`/buyer/farmer/${listing.farmerId}`)} hover>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center text-xl font-bold text-primary-600">
              {listing.farmerName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{listing.farmerName}</p>
                <Badge variant="green">Đã xác minh</Badge>
              </div>
              <p className="text-sm text-gray-500">📍 {listing.farmerLocation}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span>📦 12 sản phẩm</span>
                <span>⭐ 4.5</span>
              </div>
            </div>
            <span className="text-gray-300">›</span>
          </div>
        </Card>

        {/* Inquiry Form */}
        {!showInquiry ? (
          <Button onClick={() => setShowInquiry(true)} variant="primary" className="text-lg">
            💬 Hỏi mua
          </Button>
        ) : (
          <Card className="border-2 border-primary-200">
            <p className="font-bold text-gray-900 mb-3">Gửi yêu cầu mua hàng</p>
            <div className="space-y-3">
              <div>
                <label className="input-label">Số lượng muốn mua *</label>
                <input
                  type="number"
                  value={inquiryForm.quantity}
                  onChange={(e) => setInquiryForm(p => ({ ...p, quantity: e.target.value }))}
                  className="input-field"
                  placeholder={`Nhập số lượng (${listing.unit})`}
                />
              </div>
              <div>
                <label className="input-label">Địa điểm nhận hàng</label>
                <input
                  type="text"
                  value={inquiryForm.location}
                  onChange={(e) => setInquiryForm(p => ({ ...p, location: e.target.value }))}
                  className="input-field"
                  placeholder="Nhập địa chỉ"
                />
              </div>
              <div>
                <label className="input-label">Tin nhắn</label>
                <textarea
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm(p => ({ ...p, message: e.target.value }))}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Ghi chú thêm (nếu có)..."
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowInquiry(false)} variant="outline" className="flex-1">
                  Hủy
                </Button>
                <Button onClick={handleSendInquiry} variant="primary" className="flex-1">
                  Gửi yêu cầu
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
