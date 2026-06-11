import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockListings } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const ProductDetailManage: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const listing = mockListings.find(l => l.id === productId) || mockListings[0];

  const infoRows = [
    { label: 'Số lượng', value: `${listing.quantity} ${listing.unit}` },
    { label: 'Grade', value: listing.grade },
    { label: 'Đóng gói', value: listing.packaging || 'Bao 50kg' },
    { label: 'Khu vực', value: listing.location },
    { label: 'Ngày tạo', value: new Date(listing.createdAt).toLocaleDateString('vi-VN') },
  ];

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => navigate('/farmer/products')} className="text-gray-500">←</button>
        <h1 className="text-lg font-bold text-gray-900">Quản lý sản phẩm</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Product Header */}
        <Card>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-3xl">
              {listing.images[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-gray-900 text-lg">{listing.productName}</p>
                <StatusBadge status={listing.status} />
              </div>
              <p className="text-sm text-gray-500">{listing.description}</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-primary-700">{listing.price.toLocaleString()}đ/{listing.unit}</p>
        </Card>

        {/* Stats */}
        <Card>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-gray-900">{listing.views}</p>
              <p className="text-xs text-gray-400">Lượt xem</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{listing.inquiries}</p>
              <p className="text-xs text-gray-400">Hỏi hàng</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{listing.quantity}</p>
              <p className="text-xs text-gray-400">{listing.unit} còn lại</p>
            </div>
          </div>
        </Card>

        {/* Info */}
        <Card>
          <p className="text-sm font-bold text-gray-900 mb-3">Thông tin chi tiết</p>
          <div className="space-y-2.5">
            {infoRows.map((row, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-500">{row.label}</span>
                <span className="font-medium text-gray-900">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button variant="primary" icon="✏️">
            Chỉnh sửa
          </Button>
          <Button variant="outline" icon="🔒">
            Tạm ẩn
          </Button>
          <Button variant="outline" icon="📤">
            Chia sẻ lại
          </Button>
          <Button variant="outline" icon="💬">
            Xem tin nhắn
          </Button>
          <Button variant="danger" icon="🗑️">
            Đánh dấu hết hàng
          </Button>
        </div>
      </div>
    </div>
  );
};
