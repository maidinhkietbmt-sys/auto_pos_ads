import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAIAccuracyData, mockAIAnalysis, mockAIAnalysisLow } from '../../data/mockData';
import { Card } from '../../components/ui/Card';
import { Badge, ConfidenceBadge } from '../../components/ui/Badge';

export const AIMonitoring: React.FC = () => {
  const navigate = useNavigate();

  const totalImages = mockAIAccuracyData.reduce((s, d) => s + d.totalImages, 0);
  const avgAccuracy = Math.round(mockAIAccuracyData.reduce((s, d) => s + d.accuracy, 0) / mockAIAccuracyData.length);
  const totalCorrections = mockAIAccuracyData.reduce((s, d) => s + d.manualCorrections, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-gray-900 text-white px-6 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/admin')} className="text-white/60">← Dashboard</button>
          <h1 className="text-xl font-bold">Giám sát AI</h1>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-gray-400 text-xs">Tổng ảnh đã PT</p>
            <p className="text-xl font-bold">{totalImages}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-gray-400 text-xs">Độ chính xác TB</p>
            <p className="text-xl font-bold text-green-400">{avgAccuracy}%</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-gray-400 text-xs">Tỷ lệ conf thấp</p>
            <p className="text-xl font-bold text-yellow-400">{Math.round(mockAIAccuracyData.reduce((s, d) => s + d.lowConfidenceRate, 0) / mockAIAccuracyData.length)}%</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-gray-400 text-xs">Chỉnh sửa thủ công</p>
            <p className="text-xl font-bold">{totalCorrections}</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        {/* Accuracy by Product */}
        <Card>
          <h2 className="font-bold text-gray-900 mb-4">Độ chính xác theo sản phẩm</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Sản phẩm</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Độ chính xác</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Tổng ảnh</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Conf thấp</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Sửa tay</th>
                </tr>
              </thead>
              <tbody>
                {mockAIAccuracyData.map((data, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2.5 font-medium text-gray-900">{data.category}</td>
                    <td className="text-right py-2.5">
                      <span className={`font-medium ${
                        data.accuracy >= 85 ? 'text-green-600' : data.accuracy >= 75 ? 'text-yellow-600' : 'text-red-500'
                      }`}>{data.accuracy}%</span>
                    </td>
                    <td className="text-right py-2.5 text-gray-500">{data.totalImages}</td>
                    <td className="text-right py-2.5 text-yellow-600">{data.lowConfidenceRate}%</td>
                    <td className="text-right py-2.5 text-gray-500">{data.manualCorrections}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Low Confidence Cases */}
        <Card>
          <h2 className="font-bold text-gray-900 mb-4">⚠️ Ảnh cần review (Conf thấp)</h2>
          <div className="space-y-3">
            {[
              { id: '1', product: 'Hồ tiêu đen', conf: 45, reason: 'Kích thước không đồng đều', date: '28/05/2025' },
              { id: '2', product: 'Cà phê Arabica', conf: 52, reason: 'Màu sắc không đồng nhất', date: '28/05/2025' },
              { id: '3', product: 'Sầu riêng', conf: 38, reason: 'Hình ảnh thiếu sáng', date: '27/05/2025' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{['🌶️', '☕', '🍈'][i]}</span>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{item.product}</p>
                    <p className="text-xs text-gray-500">{item.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <ConfidenceBadge score={item.conf} />
                  <p className="text-[10px] text-gray-400 mt-1">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 btn-primary">Duyệt thủ công</button>
          <button className="flex-1 btn-secondary">Đưa vào retraining</button>
        </div>
      </div>
    </div>
  );
};
