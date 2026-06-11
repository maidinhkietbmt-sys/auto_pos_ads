import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  icon: string;
  label: string;
  path: string;
  badge?: number;
}

interface BottomNavProps {
  items: NavItem[];
  role: 'farmer' | 'buyer' | 'admin';
}

export const BottomNav: React.FC<BottomNavProps> = ({ items, role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const basePath = `/${role}`;

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== basePath && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="relative">
                <span className="text-xl">{item.icon}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold 
                    w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Default farmer navigation items
export const farmerNavItems: NavItem[] = [
  { icon: '🏠', label: 'Trang chủ', path: '/farmer' },
  { icon: '✨', label: 'Tạo bán', path: '/farmer/create' },
  { icon: '💬', label: 'Tin nhắn', path: '/farmer/inquiries', badge: 2 },
  { icon: '📋', label: 'Đơn hàng', path: '/farmer/orders' },
  { icon: '👤', label: 'Hồ sơ', path: '/farmer/profile' },
];

export const buyerNavItems: NavItem[] = [
  { icon: '🏠', label: 'Trang chủ', path: '/buyer' },
  { icon: '🔍', label: 'Tìm kiếm', path: '/buyer/search' },
  { icon: '❤️', label: 'Đã lưu', path: '/buyer/saved' },
  { icon: '💬', label: 'Tin nhắn', path: '/buyer/inquiries' },
  { icon: '👤', label: 'Hồ sơ', path: '/buyer/profile' },
];
