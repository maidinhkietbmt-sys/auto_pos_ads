import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockFarmer, mockListings } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const FarmerPublicProfile: React.FC = () => {
  const navigate = useNavigate();
  const farmerListings = mockListings.filter(l => l.farmerId === mockFarmer.id && l.status === 'active');

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">←</button>
        <h1 className="text-lg font-bold text-gray-900">Hồ sơ nông dân</h1>
      </div>

      {/* Farmer Info */}
      <div className="bg-primary-600 text-white px-5 pt-6 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            {mockFarmer.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{mockFarmer.name}</h1>
            <p className="text-primary-200 text-sm">📍 {mockFarmer.location}</p>
            <p className="text-primary-200 text-sm">{mockFarmer.farmName}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="green">Xác minh SDT ✓</Badge>
              <span className="text-primary-200 text-xs">⭐ 4.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-4">
        <Card>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { value: '12', label: 'Sản phẩm' },
              { value: '8', label: 'Giao dịch' },
              { value: '4.5', label: 'Đánh giá' },
              { value: '98%', label: 'Phản hồi' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-[10px] text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bio */}
      <div className="px-4 mt-4">
        <Card>
          <p className="text-sm font-medium text-gray-900 mb-2">Giới thiệu</p>
          <p className="text-sm text-gray-600">{mockFarmer.bio}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {mockFarmer.mainProducts.map((p, i) => (
              <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">{p}</span>
            ))}
          </div>
        </Card>
      </div>

      {/* Trust badges */}
      <div className="px-4 mt-4">
        <Card>
          <p className="text-sm font-medium text-gray-900 mb-3">🏆 Uy tín</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '✅', label: 'Verified Farmer' },
              { icon: '⚡', label: 'Good Response' },
              { icon: '🔄', label: 'Repeat Seller' },
              { icon: '🔬', label: 'Quality Confirmed' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5">
                <span>{badge.icon}</span>
                <span className="text-xs text-gray-700">{badge.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Products */}
      <div className="px-4 mt-4">
        <p className="text-sm font-bold text-gray-900 mb-3">Sản phẩm đang bán</p>
        <div className="grid grid-cols-2 gap-3">
          {farmerListings.map(listing => (
            <button
              key={listing.id}
              onClick={() => navigate(`/buyer/product/${listing.id}`)}
              className="bg-white rounded-2xl p-3 text-left border border-gray-100 active:scale-[0.98] transition-transform"
            >
              <div className="w-full h-24 bg-primary-50 rounded-xl flex items-center justify-center text-3xl mb-2">
                {listing.images[0]}
              </div>
              <p className="font-semibold text-sm text-gray-900 truncate">{listing.productName}</p>
              <p className="text-xs text-gray-400">{listing.quantity}{listing.unit}</p>
              <p className="font-bold text-primary-700 text-sm">{listing.price.toLocaleString()}đ</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
