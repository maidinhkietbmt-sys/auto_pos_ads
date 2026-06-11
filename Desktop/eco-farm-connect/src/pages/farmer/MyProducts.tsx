import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockListings } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomNav, farmerNavItems } from '../../components/ui/BottomNav';
import type { ListingStatus } from '../../types';

const tabs: { id: ListingStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'active', label: 'Đang bán' },
  { id: 'draft', label: 'Nháp' },
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'sold', label: 'Đã bán' },
];

export const MyProducts: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = (searchParams.get('tab') as ListingStatus) || 'all';
  const [activeTab, setActiveTab] = useState<ListingStatus | 'all'>(defaultTab);

  const filteredListings = activeTab === 'all'
    ? mockListings
    : mockListings.filter(l => l.status === activeTab);

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-gray-900">Sản phẩm của tôi</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 pb-2 overflow-x-auto">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="px-4 mt-4 space-y-3">
        {filteredListings.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Chưa có sản phẩm nào"
            description="Bắt đầu tạo bài bán mới để kết nối với người mua"
            action={{ label: '+ Tạo bài bán mới', onClick: () => navigate('/farmer/create') }}
          />
        ) : (
          filteredListings.map(listing => (
            <Card
              key={listing.id}
              onClick={() => navigate(`/farmer/products/${listing.id}`)}
              hover
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center text-2xl">
                  {listing.images[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 truncate">{listing.productName}</p>
                    <StatusBadge status={listing.status} />
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
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/farmer/create')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg 
          flex items-center justify-center text-2xl active:scale-90 transition-transform z-40"
      >
        +
      </button>

      <BottomNav items={farmerNavItems} role="farmer" />
    </div>
  );
};
