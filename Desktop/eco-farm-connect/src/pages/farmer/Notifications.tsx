import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockNotifications } from '../../data/mockData';
import { EmptyState } from '../../components/ui/EmptyState';

const notifIcons: Record<string, string> = {
  inquiry: '💬',
  message: '✉️',
  listing_approved: '✅',
  price_change: '📈',
  logistics_warning: '⚠️',
  order_reminder: '📅',
  system: '🔔',
};

export const Notifications: React.FC = () => {
  const navigate = useNavigate();

  const sortedNotifs = [...mockNotifications].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="mobile-container min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">←</button>
        <h1 className="text-lg font-bold text-gray-900">Thông báo</h1>
      </div>

      <div className="px-4 mt-4 space-y-2">
        {sortedNotifs.length === 0 ? (
          <EmptyState icon="🔔" title="Không có thông báo" description="Bạn sẽ nhận được thông báo khi có hoạt động mới" />
        ) : (
          sortedNotifs.map(notif => (
            <button
              key={notif.id}
              onClick={() => notif.linkTo && navigate(notif.linkTo)}
              className={`w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-all
                ${!notif.read ? 'bg-primary-50 border border-primary-100' : 'bg-white border border-gray-100'}
                ${notif.linkTo ? 'active:scale-[0.99]' : ''}`}
            >
              <span className="text-xl mt-0.5">{notifIcons[notif.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-sm ${!notif.read ? 'font-bold' : 'font-medium'} text-gray-900`}>{notif.title}</p>
                  {!notif.read && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-500">{notif.message}</p>
                <p className="text-[10px] text-gray-300 mt-1">
                  {new Date(notif.createdAt).toLocaleDateString('vi-VN', {
                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
                  })}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
