import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockInquiries } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomNav, farmerNavItems } from '../../components/ui/BottomNav';
import type { InquiryStatus } from '../../types';

const tabs: { id: InquiryStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'new', label: 'Mới' },
  { id: 'negotiating', label: 'Đang trao đổi' },
  { id: 'confirmed', label: 'Đã chốt' },
];

export const Inquiries: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<InquiryStatus | 'all'>('all');

  const filtered = activeTab === 'all'
    ? mockInquiries
    : mockInquiries.filter(i => i.status === activeTab);

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-gray-900">Tin nhắn hỏi hàng</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 pb-2">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon="💬"
            title="Chưa có tin nhắn hỏi hàng"
            description="Khi người mua quan tâm đến sản phẩm, họ sẽ gửi tin nhắn cho bạn"
          />
        ) : (
          filtered.map(inquiry => (
            <Card
              key={inquiry.id}
              onClick={() => navigate(`/farmer/inquiries/chat/${inquiry.id}`)}
              hover
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-lg font-bold text-blue-600 flex-shrink-0">
                  {inquiry.buyerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900 truncate">{inquiry.buyerName}</p>
                    <StatusBadge status={inquiry.status} />
                  </div>
                  <p className="text-sm text-gray-500 truncate">{inquiry.listingTitle}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {inquiry.requestedQuantity}kg · {inquiry.deliveryLocation}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400 truncate flex-1 mr-2">
                      {inquiry.lastMessage}
                    </p>
                    <span className="text-[10px] text-gray-300 whitespace-nowrap">
                      {new Date(inquiry.lastMessageTime).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <BottomNav items={farmerNavItems} role="farmer" />
    </div>
  );
};
