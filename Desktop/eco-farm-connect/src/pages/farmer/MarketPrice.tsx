import React from 'react';
import { useNavigate } from 'react-router-dom';
import { marketPrices } from '../../data/mockData';
import { Card } from '../../components/ui/Card';

const priceHistory = [
  { date: '25/05', value: 45000 },
  { date: '26/05', value: 46000 },
  { date: '27/05', value: 47000 },
  { date: '28/05', value: 46500 },
  { date: '29/05', value: 48000 },
];

export const MarketPrice: React.FC = () => {
  const navigate = useNavigate();

  const maxPrice = Math.max(...priceHistory.map(p => p.value));
  const minPrice = Math.min(...priceHistory.map(p => p.value));

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">←</button>
        <h1 className="text-lg font-bold text-gray-900">Giá thị trường</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <p className="text-sm text-gray-500">Giá tham khảo hôm nay (chỉ mang tính tham khảo)</p>

        {/* Current Prices */}
        <div className="space-y-3">
          {marketPrices.map((item, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{item.product}</p>
                  <p className="text-xs text-gray-400">Đơn vị: {item.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{item.price.toLocaleString()}đ</p>
                  <p className={`text-xs flex items-center gap-1 justify-end ${item.isUp ? 'text-green-600' : 'text-red-500'}`}>
                    {item.isUp ? '↑' : '↓'} {item.change}đ
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Mini Chart */}
        <Card>
          <p className="text-sm font-bold text-gray-900 mb-4">Xu hướng giá (Cà phê Robusta)</p>
          <div className="flex items-end gap-1 h-32">
            {priceHistory.map((point, i) => {
              const height = ((point.value - minPrice) / (maxPrice - minPrice)) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary-500 rounded-t-lg transition-all hover:bg-primary-600"
                    style={{ height: `${Math.max(height, 10)}%` }}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">{point.date}</p>
                  <p className="text-[9px] text-gray-500 font-medium">{point.value.toLocaleString()}đ</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Note */}
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <p className="text-xs text-yellow-700">
            📌 Giá chỉ mang tính tham khảo từ các nguồn thị trường. Giá thực tế có thể thay đổi tùy theo thỏa thuận giữa người bán và người mua.
          </p>
        </div>
      </div>
    </div>
  );
};
