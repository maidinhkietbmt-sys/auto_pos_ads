import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

export const Settings: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Tài khoản',
      items: [
        { icon: '👤', label: 'Thông tin cá nhân', desc: 'Họ tên, số điện thoại, địa chỉ' },
        { icon: '🏠', label: 'Thông tin trang trại', desc: 'Tên trang trại, khu vực, sản phẩm chính' },
        { icon: '🔒', label: 'Đổi mật khẩu', desc: 'Cập nhật mật khẩu đăng nhập' },
      ]
    },
    {
      title: 'Giao diện',
      items: [
        { icon: '🌐', label: 'Ngôn ngữ', desc: 'Tiếng Việt (hiện tại)' },
        { icon: '🔔', label: 'Thông báo', desc: 'Cài đặt thông báo đẩy' },
      ]
    },
    {
      title: 'AI & Dữ liệu',
      items: [
        { icon: '🤖', label: 'Tùy chỉnh AI', desc: 'Cài đặt đề xuất AI tự động' },
        { icon: '📊', label: 'Xuất dữ liệu', desc: 'Tải xuống lịch sử bán hàng' },
      ]
    },
    {
      title: 'Hỗ trợ',
      items: [
        { icon: '❓', label: 'Trung tâm trợ giúp', desc: 'Hướng dẫn sử dụng app' },
        { icon: '💬', label: 'Liên hệ hỗ trợ', desc: 'Gửi câu hỏi cho đội ngũ vận hành' },
        { icon: 'ℹ️', label: 'Phiên bản', desc: 'Eco-Farm Connect v1.0.0 (MVP)' },
      ]
    },
  ];

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => navigate('/farmer/profile')} className="text-gray-500">←</button>
        <h1 className="text-lg font-bold text-gray-900">Cài đặt</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {sections.map((section, si) => (
          <div key={si}>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-1">{section.title}</p>
            <Card className="divide-y divide-gray-50">
              {section.items.map((item, ii) => (
                <button key={ii} className="w-full flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 text-left">
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <span className="text-gray-300">›</span>
                </button>
              ))}
            </Card>
          </div>
        ))}
      </div>

      <div className="px-4 mt-8">
        <button className="w-full py-3 text-center text-red-500 text-sm font-medium rounded-xl hover:bg-red-50">
          Xóa tài khoản
        </button>
      </div>
    </div>
  );
};
