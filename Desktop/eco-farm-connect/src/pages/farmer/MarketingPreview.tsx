import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProgressBar, listingSteps } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { mockMarketingContent } from '../../data/mockData';
import type { ContentTone } from '../../types';

const tones: { id: ContentTone; label: string; icon: string }[] = [
  { id: 'simple', label: 'Đơn giản', icon: '📝' },
  { id: 'professional', label: 'Chuyên nghiệp', icon: '💼' },
  { id: 'friendly', label: 'Gần gũi', icon: '🌿' },
  { id: 'premium', label: 'Cao cấp', icon: '✨' },
  { id: 'promotional', label: 'Khuyến mãi', icon: '🏷️' },
];

const platforms = [
  { id: 'facebook', label: 'Facebook', icon: '📘' },
  { id: 'zalo', label: 'Zalo', icon: '💬' },
  { id: 'tiktok', label: 'TikTok Shop', icon: '🎵' },
  { id: 'shopee', label: 'Shopee', icon: '🛍️' },
  { id: 'direct', label: 'Tin nhắn trực tiếp', icon: '✉️' },
  { id: 'copy', label: 'Sao chép nội dung', icon: '📋' },
];

type Tab = 'title' | 'description' | 'social' | 'hashtags';

export const MarketingPreview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productType = (location.state as any)?.productType || { name: 'Sản phẩm', icon: '📦' };
  const productInfo = (location.state as any)?.productInfo || {};
  const price = (location.state as any)?.price || {};

  const content = mockMarketingContent;
  const [activeTab, setActiveTab] = useState<Tab>('title');
  const [selectedTone, setSelectedTone] = useState<ContentTone>('simple');
  const [selectedPlatform, setSelectedPlatform] = useState('facebook');
  const [editedContent, setEditedContent] = useState(content);
  const [approved, setApproved] = useState(false);

  const handleEdit = (field: string, value: string) => {
    setEditedContent(prev => ({ ...prev, [field]: value }));
  };

  const handleRegenerate = () => {
    // Simulate regeneration
    setEditedContent({
      ...content,
      socialCaption: content.socialCaption + ' (đã làm mới)',
    });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'title', label: 'Tiêu đề' },
    { id: 'description', label: 'Mô tả' },
    { id: 'social', label: 'Caption' },
    { id: 'hashtags', label: 'Hashtags' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'title':
        return (
          <textarea
            value={editedContent.title}
            onChange={(e) => handleEdit('title', e.target.value)}
            className="input-field min-h-[60px] resize-none"
          />
        );
      case 'description':
        return (
          <textarea
            value={editedContent.detailedDescription}
            onChange={(e) => handleEdit('detailedDescription', e.target.value)}
            className="input-field min-h-[200px] resize-none"
          />
        );
      case 'social':
        return (
          <div className="space-y-3">
            <textarea
              value={editedContent.socialCaption}
              onChange={(e) => handleEdit('socialCaption', e.target.value)}
              className="input-field min-h-[100px] resize-none"
            />
            <div className="flex gap-2 flex-wrap">
              {['Ngắn hơn', 'Chuyên nghiệp hơn', 'Dễ hiểu hơn', 'Thêm thông tin giao hàng'].map((action) => (
                <button key={action} onClick={handleRegenerate}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs hover:bg-gray-200">
                  {action}
                </button>
              ))}
            </div>
          </div>
        );
      case 'hashtags':
        return (
          <div className="flex flex-wrap gap-2">
            {editedContent.hashtags.map((tag, i) => (
              <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
            <input
              type="text"
              placeholder="+ Thêm hashtag"
              className="px-3 py-1.5 border-2 border-dashed border-gray-200 rounded-full text-sm outline-none focus:border-primary-300"
            />
          </div>
        );
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate('/farmer/create/price')} className="text-gray-500">←</button>
          <h1 className="text-lg font-bold text-gray-900">Nội dung bán hàng</h1>
        </div>
      </div>
      <ProgressBar steps={listingSteps} currentStep={6} />

      <div className="px-4 space-y-4">
        {/* Tone Selection */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Chọn giọng văn:</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tones.map(tone => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all
                  ${selectedTone === tone.id
                    ? 'bg-primary-100 text-primary-700 border border-primary-200 font-medium'
                    : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                {tone.icon} {tone.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all
                ${activeTab === tab.id
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Preview */}
        <Card>
          {renderContent()}
        </Card>

        {/* Preview Card */}
        <Card className="border border-gray-200">
          <p className="text-xs text-gray-400 mb-2">Xem trước bài đăng:</p>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-lg">
                👨‍🌾
              </div>
              <div>
                <p className="font-semibold text-sm">Nguyễn Văn An</p>
                <p className="text-xs text-gray-400">Vừa xong</p>
              </div>
            </div>
            <p className="font-semibold text-gray-900 mb-2">{editedContent.title}</p>
            <p className="text-sm text-gray-600 mb-2">{editedContent.shortDescription}</p>
            <p className="text-sm text-gray-500">{editedContent.socialCaption}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {editedContent.hashtags.map((tag, i) => (
                <span key={i} className="text-sm text-blue-500">{tag}</span>
              ))}
            </div>
          </div>
        </Card>

        {/* Platform Selection */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Chọn kênh đăng:</p>
          <div className="grid grid-cols-3 gap-2">
            {platforms.map(pf => (
              <button
                key={pf.id}
                onClick={() => setSelectedPlatform(pf.id)}
                className={`p-3 rounded-xl text-center text-sm transition-all
                  ${selectedPlatform === pf.id
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                <div className="text-lg mb-1">{pf.icon}</div>
                {pf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Approval Checkbox */}
        <label className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 cursor-pointer">
          <input
            type="checkbox"
            checked={approved}
            onChange={(e) => setApproved(e.target.checked)}
            className="mt-0.5 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <p className="text-sm text-gray-600">
            Tôi đã kiểm tra và xác nhận thông tin sản phẩm, giá bán và nội dung đăng là đúng.
          </p>
        </label>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/farmer/create/publish', {
              state: {
                ...location.state,
                marketingContent: editedContent,
                selectedPlatform,
                approved
              }
            })}
            disabled={!approved}
            variant="primary"
          >
            {approved ? '🚀 Tiếp tục đến đăng bán' : 'Vui lòng xác nhận thông tin'}
          </Button>
          <Button onClick={handleRegenerate} variant="secondary">
            Tạo lại nội dung
          </Button>
          <Button onClick={() => navigate('/farmer')} variant="ghost" className="w-full">
            Lưu nháp
          </Button>
        </div>
      </div>
    </div>
  );
};
