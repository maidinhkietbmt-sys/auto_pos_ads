import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

const faqs = [
  {
    q: 'Làm thế nào để tạo bài bán mới?',
    a: 'Nhấn nút "+ Tạo bài bán mới" trên trang chủ. Chọn loại sản phẩm, chụp ảnh, AI sẽ tự động phân tích và đề xuất thông tin. Bạn chỉ cần xác nhận từng bước.'
  },
  {
    q: 'AI phân tích chất lượng có chính xác không?',
    a: 'AI đề xuất kết quả dựa trên hình ảnh. Độ chính xác hiện tại khoảng 80-90% tùy sản phẩm. Bạn luôn có thể chỉnh sửa kết quả thủ công nếu cần.'
  },
  {
    q: 'Tôi có thể bán sản phẩm gì trên app?',
    a: 'Hiện tại app hỗ trợ: Cà phê, Hồ tiêu và Trái cây. Các sản phẩm khác sẽ được hỗ trợ trong thời gian tới.'
  },
  {
    q: 'Làm sao để nhận được thông báo khi có người hỏi mua?',
    a: 'Bạn sẽ nhận được thông báo đẩy trên điện thoại khi có người mua quan tâm đến sản phẩm của bạn.'
  },
  {
    q: 'Tôi có thể chỉnh sửa bài đăng sau khi đăng không?',
    a: 'Có. Vào mục "Sản phẩm của tôi", chọn bài đăng bạn muốn chỉnh sửa và nhấn "Chỉnh sửa".'
  },
  {
    q: 'Phí sử dụng app là bao nhiêu?',
    a: 'Trong giai đoạn MVP, app hoàn toàn miễn phí. Phí nền tảng sẽ được áp dụng sau.'
  },
];

export const HelpCenter: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 pt-4 pb-2 flex items-center gap-3">
        <button onClick={() => navigate('/farmer/profile')} className="text-gray-500">←</button>
        <h1 className="text-lg font-bold text-gray-900">Trung tâm trợ giúp</h1>
      </div>

      {/* Search */}
      <div className="px-4 mt-4">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Tìm câu hỏi..."
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl text-sm outline-none border border-gray-100 focus:border-primary-300"
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="px-4 mt-4 space-y-2">
        <p className="text-sm font-bold text-gray-900 mb-3">Câu hỏi thường gặp</p>
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="text-sm font-medium text-gray-900 flex-1 pr-4">{faq.q}</span>
              <span className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {openFaq === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="px-4 mt-6">
        <Card>
          <div className="text-center">
            <span className="text-3xl mb-2 block">💬</span>
            <p className="font-semibold text-gray-900 mb-1">Không tìm thấy câu trả lời?</p>
            <p className="text-sm text-gray-500 mb-4">Liên hệ đội ngũ hỗ trợ của chúng tôi</p>
            <button className="btn-primary max-w-[200px] mx-auto">Gửi câu hỏi</button>
          </div>
        </Card>
      </div>
    </div>
  );
};
