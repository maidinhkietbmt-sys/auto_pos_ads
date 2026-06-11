import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockOrders } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomNav, farmerNavItems } from '../../components/ui/BottomNav';

const statusLabels: Record<string, { label: string; variant: 'green' | 'yellow' | 'blue' | 'red' | 'gray' }> = {
  pending: { label: 'Chờ xác nhận', variant: 'yellow' },
  confirmed: { label: 'Đã xác nhận', variant: 'green' },
  shipping: { label: 'Đang giao', variant: 'blue' },
  delivered: { label: 'Đã giao', variant: 'green' },
  cancelled: { label: 'Đã hủy', variant: 'red' },
};

export const Orders: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-gray-900">Đơn hàng</h1>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {mockOrders.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Chưa có đơn hàng"
            description="Khi có người mua xác nhận giao dịch, đơn hàng sẽ hiển thị ở đây"
          />
        ) : (
          mockOrders.map(order => {
            const status = statusLabels[order.status] || { label: order.status, variant: 'gray' as const };
            return (
              <Card key={order.id} onClick={() => navigate(`/farmer/orders/${order.id}`)} hover>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{order.productName}</p>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Người mua</p>
                    <p className="font-medium text-gray-900">{order.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Số lượng</p>
                    <p className="font-medium text-gray-900">{order.quantity}kg</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tổng tiền</p>
                    <p className="font-bold text-primary-700">{order.totalAmount.toLocaleString()}đ</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ngày giao</p>
                    <p className="font-medium text-gray-900">{new Date(order.deliveryDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <BottomNav items={farmerNavItems} role="farmer" />
    </div>
  );
};
