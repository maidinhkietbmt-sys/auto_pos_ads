import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockListings, mockBuyer } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BottomNav, buyerNavItems } from '../../components/ui/BottomNav';

export const BuyerHome: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'coffee', label: '☕ Cà phê' },
    { id: 'pepper', label: '🌶️ Hồ tiêu' },
    { id: 'fruit', label: '🍎 Trái cây' },
  ];

  const activeListings = mockListings.filter(l => l.status === 'active');
  const filtered = activeListings.filter(l => {
    const matchSearch = l.productName.toLowerCase().includes(search.toLowerCase()) ||
      l.farmerName.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'all' || l.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Xin chào,</p>
            <h1 className="text-lg font-bold text-gray-900">{mockBuyer.businessName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400">
              <span className="text-xl">🔔</span>
            </button>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
              {mockBuyer.name.charAt(0)}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm nông sản..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none focus:bg-gray-100"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white px-4 pb-3 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                ${selectedCategory === cat.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 py-3">
        <p className="text-xs text-gray-400">{filtered.length} sản phẩm được tìm thấy</p>
      </div>

      {/* Product Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {filtered.map(listing => (
          <button
            key={listing.id}
            onClick={() => navigate(`/buyer/product/${listing.id}`)}
            className="bg-white rounded-2xl p-3 text-left border border-gray-100 active:scale-[0.98] transition-transform"
          >
            <div className="w-full h-28 bg-gradient-to-br from-primary-50 to-green-50 rounded-xl flex items-center justify-center text-4xl mb-3">
              {listing.images[0]}
            </div>
            <div className="flex items-center gap-1 mb-1">
              <Badge variant="green">{listing.grade}</Badge>
              <Badge variant="gray">AI-graded</Badge>
            </div>
            <p className="font-semibold text-gray-900 text-sm mb-1">{listing.productName}</p>
            <p className="text-xs text-gray-400 mb-2">📍 {listing.farmerLocation}</p>
            <p className="font-bold text-primary-700">{listing.price.toLocaleString()}đ/{listing.unit}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">Còn: {listing.quantity}{listing.unit}</span>
              <span className="text-xs text-gray-300">★ {3.5 + Math.random()}</span>
            </div>
          </button>
        ))}
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 px-6">
          <span className="text-4xl mb-3">🔍</span>
          <p className="font-semibold text-gray-900 mb-1">Không tìm thấy sản phẩm</p>
          <p className="text-sm text-gray-500 text-center">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
        </div>
      )}

      <BottomNav items={buyerNavItems} role="buyer" />
    </div>
  );
};
