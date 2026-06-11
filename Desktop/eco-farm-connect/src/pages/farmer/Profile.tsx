import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockFarmer } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BottomNav, farmerNavItems } from '../../components/ui/BottomNav';

export const FarmerProfile: React.FC = () => {
  const navigate = useNavigate();

  const verificationLabels: Record<string, string> = {
    unverified: 'Chưa xác minh',
    phone: 'Đã xác minh SDT',
    location: 'Đã xác minh địa điểm',
    admin: 'Đã xác minh bởi Admin',
  };

  const verificationVariants: Record<string, 'red' | 'yellow' | 'green' | 'blue'> = {
    unverified: 'red',
    phone: 'yellow',
    location: 'blue',
    admin: 'green',
  };

  const menuItems = [
    { icon: '📊', label: 'Thống kê bán hàng', path: '/farmer/stats' },
    { icon: '🔔', label: 'Thông báo', path: '/farmer/notifications' },
    { icon: '⚙️', label: 'Cài đặt', path: '/farmer/settings' },
    { icon: '🐍', label: 'Học Python', path: '/farmer/tutorial' },
    { icon: '❓', label: 'Trợ giúp', path: '/farmer/help' },
  ];

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-primary-600 text-white px-5 pt-8 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
            {mockFarmer.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{mockFarmer.name}</h1>
            <p className="text-primary-200 text-sm">📍 {mockFarmer.location}</p>
            <p className="text-primary-200 text-sm">{mockFarmer.farmName}</p>
            <div className="mt-2">
              <Badge variant={verificationVariants[mockFarmer.verificationStatus]}>
                {verificationLabels[mockFarmer.verificationStatus]}
              </Badge>
            </div>
          </div>
          <button className="text-white/80">
            <span className="text-xl">✏️</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-4">
        <Card>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { value: mockFarmer.totalListings, label: 'Đã đăng' },
              { value: mockFarmer.totalDeals, label: 'Giao dịch' },
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
          <p className="text-sm font-medium text-gray-900 mb-1">Giới thiệu</p>
          <p className="text-sm text-gray-600">{mockFarmer.bio}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {mockFarmer.mainProducts.map((p, i) => (
              <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">
                {p}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Menu */}
      <div className="px-4 mt-4 space-y-1">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-4 p-4 bg-white rounded-xl active:bg-gray-50 transition-colors"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium text-gray-900 flex-1 text-left">{item.label}</span>
            <span className="text-gray-300">›</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 mt-6 mb-4">
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 text-center text-red-500 text-sm font-medium rounded-xl hover:bg-red-50"
        >
          Đăng xuất
        </button>
      </div>

      <BottomNav items={farmerNavItems} role="farmer" />
    </div>
  );
};
