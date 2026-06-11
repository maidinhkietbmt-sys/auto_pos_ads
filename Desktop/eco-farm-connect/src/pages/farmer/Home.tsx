import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockFarmer, mockListings, mockNotifications, marketPrices } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BottomNav, farmerNavItems } from '../../components/ui/BottomNav';

const unreadNotifs = mockNotifications.filter(n => !n.read).length;
const activeListings = mockListings.filter(l => l.status === 'active').length;
const draftListings = mockListings.filter(l => l.status === 'draft').length;
const totalInquiries = mockListings.reduce((sum, l) => sum + l.inquiries, 0);

export const FarmerHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mobile-container pb-20">
      {/* Header */}
      <div className="bg-primary-600 text-white px-5 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-100 text-sm">Xin chào,</p>
            <h1 className="text-xl font-bold">{mockFarmer.name}</h1>
            <p className="text-primary-200 text-sm mt-0.5">📍 {mockFarmer.location}</p>
          </div>
          <button onClick={() => navigate('/farmer/notifications')} className="relative p-2">
            <span className="text-2xl">🔔</span>
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold 
                w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary-600">
                {unreadNotifs}
              </span>
            )}
          </button>
        </div>

        {/* Main CTA */}
        <button onClick={() => navigate('/farmer/create')}
          className="w-full bg-white/20 backdrop-blur-sm rounded-2xl p-5 
            border border-white/30 active:scale-[0.98] transition-transform">
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">📸</span>
            <div className="text-left">
              <p className="text-lg font-bold">+ Tạo bài bán mới</p>
              <p className="text-white/80 text-sm">Chỉ cần chụp ảnh sản phẩm, AI sẽ hỗ trợ phần còn lại</p>
            </div>
          </div>
        </button>
      </div>

      {/* Quick Stats Cards */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          <Card onClick={() => navigate('/farmer/products')} hover>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📦</span>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeListings}</p>
                <p className="text-xs text-gray-500">Sản phẩm đang bán</p>
              </div>
            </div>
          </Card>
          <Card onClick={() => navigate('/farmer/inquiries')} hover>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalInquiries}</p>
                <p className="text-xs text-gray-500">Tin nhắn hỏi hàng</p>
              </div>
            </div>
          </Card>
          <Card onClick={() => navigate('/farmer/market')} hover>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <p className="text-sm font-bold text-gray-900">Giá hôm nay</p>
                <p className="text-xs text-green-600">{marketPrices[0].change}đ</p>
              </div>
            </div>
          </Card>
          <Card onClick={() => navigate('/farmer/products?tab=draft')} hover>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <p className="text-2xl font-bold text-gray-900">{draftListings}</p>
                <p className="text-xs text-gray-500">Nháp chưa đăng</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Market Price Alert */}
      <div className="px-4 mt-4">
        <Card className="border-l-4 border-l-yellow-400 bg-yellow-50/50">
          <div className="flex items-start gap-3">
            <span className="text-xl">📊</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm mb-2">Giá thị trường hôm nay</p>
              <div className="space-y-1.5">
                {marketPrices.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.product}</span>
                    <span className="font-medium">{item.price.toLocaleString()}đ/kg</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Giá chỉ mang tính tham khảo</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Products */}
      <div className="px-4 mt-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Sản phẩm đang bán</h2>
          <button onClick={() => navigate('/farmer/products')} className="text-sm text-primary-600 font-medium">
            Xem tất cả →
          </button>
        </div>
        <div className="space-y-3">
          {mockListings.filter(l => l.status === 'active').slice(0, 3).map((listing) => (
            <Card key={listing.id} onClick={() => navigate(`/farmer/products/${listing.id}`)} hover>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center text-2xl">
                  {listing.images[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 truncate">{listing.productName}</p>
                    <Badge variant="green">{listing.grade}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{listing.quantity} {listing.unit}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="font-bold text-primary-700">{listing.price.toLocaleString()}đ/{listing.unit}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>👁️ {listing.views}</span>
                      <span>💬 {listing.inquiries}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav items={farmerNavItems} role="farmer" />
    </div>
  );
};
