import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAdminStats, mockAIAccuracyData } from '../../data/mockData';
import { KPICard } from '../../components/ui/Card';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const stats = mockAdminStats;

  const menuItems = [
    { icon: '👨‍🌾', label: 'Quản lý nông dân', path: '/admin/farmers', color: 'green' as const },
    { icon: '🛒', label: 'Quản lý người mua', path: '/admin/buyers', color: 'blue' as const },
    { icon: '📦', label: 'Quản lý bài đăng', path: '/admin/listings', color: 'purple' as const },
    { icon: '🤖', label: 'Giám sát AI', path: '/admin/ai-monitoring', color: 'yellow' as const },
    { icon: '📊', label: 'Dữ liệu giá', path: '/admin/prices', color: 'green' as const },
    { icon: '📋', label: 'Duyệt nội dung', path: '/admin/moderation', color: 'red' as const },
    { icon: '📈', label: 'Báo cáo Pilot', path: '/admin/reports', color: 'blue' as const },
    { icon: '⚙️', label: 'Cài đặt hệ thống', path: '/admin/settings', color: 'gray' as const },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white px-6 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-400 text-sm">Admin Dashboard</p>
            <h1 className="text-2xl font-bold">Eco-Farm Connect</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs text-white/80 hover:bg-white/20">
              Trang chủ
            </button>
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
              A
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-gray-400 text-xs mb-1">Tổng nông dân</p>
            <p className="text-2xl font-bold">{stats.totalFarmers}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-gray-400 text-xs mb-1">Người mua</p>
            <p className="text-2xl font-bold">{stats.activeBuyers}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-gray-400 text-xs mb-1">Bài đang bán</p>
            <p className="text-2xl font-bold">{stats.activeListings}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-gray-400 text-xs mb-1">Cần duyệt</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pendingApprovals}</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4">
        <div className="grid grid-cols-4 gap-3 mb-6">
          <KPICard label="Bài mới/tuần" value={stats.newListingsThisWeek} icon="📝" color="green" />
          <KPICard label="Lượng hỏi hàng" value={stats.totalInquiries} icon="💬" color="blue" />
          <KPICard label="AI conf thấp" value={stats.lowConfidenceCases} icon="⚠️" color="yellow" />
          <KPICard label="Khiếu nại" value={stats.complaints} icon="🚨" color="red" />
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-2xl p-4 text-left border border-gray-100 hover:border-gray-200 active:scale-[0.98] transition-all"
            >
              <span className="text-2xl block mb-2">{item.icon}</span>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
            </button>
          ))}
        </div>

        {/* AI Accuracy Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Độ chính xác AI theo sản phẩm</h2>
            <span className="text-xs text-gray-400">Cập nhật gần đây</span>
          </div>
          <div className="space-y-4">
            {mockAIAccuracyData.map((data, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900">{data.category}</span>
                  <span className="text-gray-500">{data.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      data.accuracy >= 85 ? 'bg-green-500' :
                      data.accuracy >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${data.accuracy}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
                  <span>{data.totalImages} ảnh</span>
                  <span>{data.lowConfidenceRate}% conf thấp</span>
                  <span>{data.manualCorrections} chỉnh sửa</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Hoạt động gần đây</h2>
          <div className="space-y-3">
            {[
              { time: '5 phút trước', text: 'Bài đăng mới: Cà phê Robusta Grade 1 cần duyệt', type: 'warning' as const },
              { time: '30 phút trước', text: 'AI low confidence: Hồ tiêu đen - 45%', type: 'danger' as const },
              { time: '2 giờ trước', text: 'Nông dân mới đăng ký: Trang trại Xanh Đắk Lắk', type: 'info' as const },
              { time: '4 giờ trước', text: 'Giao dịch thành công: 500kg Cà phê Arabica', type: 'success' as const },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  activity.type === 'danger' ? 'bg-red-500' :
                  activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
