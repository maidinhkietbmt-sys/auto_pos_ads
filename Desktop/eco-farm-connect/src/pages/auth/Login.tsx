import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type AuthView = 'welcome' | 'role' | 'login' | 'register';

export const LoginPage: React.FC = () => {
  const [view, setView] = useState<AuthView>('welcome');
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'farmer' | 'buyer') => {
    if (role === 'farmer') {
      navigate('/farmer');
    } else {
      navigate('/buyer');
    }
  };

  if (view === 'welcome') {
    return (
      <div className="mobile-container min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-6xl mb-4">🌿</div>
          <h1 className="text-3xl font-bold text-primary-700 text-center mb-2">Eco-Farm Connect</h1>
          <p className="text-gray-500 text-center text-sm mb-8 max-w-[280px]">
            Nền tảng nông nghiệp thông minh – Bán nông sản dễ dàng hơn với AI
          </p>
          <div className="bg-primary-50 rounded-2xl p-4 mb-8 border border-primary-100 w-full">
            <p className="text-sm text-primary-800 text-center">
              "One photo becomes a product listing, a suggested price, a marketing post, and a sales opportunity."
            </p>
          </div>
          <button onClick={() => setView('role')} className="btn-primary text-lg font-bold py-4">
            Bắt đầu ngay
          </button>
        </div>
        <div className="p-6 text-center">
          <p className="text-xs text-gray-400">
            Bằng cách tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật
          </p>
        </div>
      </div>
    );
  }

  if (view === 'role') {
    return (
      <div className="mobile-container min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6">
          <button onClick={() => setView('welcome')} className="self-start text-gray-400 mb-6 text-sm">← Quay lại</button>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bạn là ai?</h2>
          <p className="text-gray-500 text-sm mb-8">Chọn vai trò để bắt đầu trải nghiệm phù hợp</p>
          
          <button onClick={() => handleRoleSelect('farmer')} 
            className="w-full p-6 rounded-2xl border-2 border-primary-100 bg-primary-50/50 mb-4 text-left
              active:scale-[0.98] active:border-primary-300 transition-all">
            <div className="flex items-center gap-4">
              <span className="text-4xl">👨‍🌾</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Nông dân</h3>
                <p className="text-sm text-gray-500">Bán nông sản, quản lý đơn hàng, kết nối người mua</p>
              </div>
            </div>
          </button>
          
          <button onClick={() => handleRoleSelect('buyer')}
            className="w-full p-6 rounded-2xl border-2 border-blue-100 bg-blue-50/50 text-left
              active:scale-[0.98] active:border-blue-300 transition-all">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🛒</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Người mua</h3>
                <p className="text-sm text-gray-500">Tìm nông sản chất lượng, kết nối trực tiếp nông dân</p>
              </div>
            </div>
          </button>

          <button onClick={() => navigate('/admin')} className="mt-8 text-center text-sm text-gray-400 hover:text-gray-600">
            Đăng nhập quản trị →
          </button>
        </div>
      </div>
    );
  }

  return null;
};
