import React from 'react';

interface Step {
  label: string;
  icon?: string;
}

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex flex-col items-center ${index <= currentStep ? 'text-primary-600' : 'text-gray-300'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-all
                ${index < currentStep 
                  ? 'bg-primary-600 text-white' 
                  : index === currentStep 
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100' 
                    : 'bg-gray-100 text-gray-400'}`}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className="text-[10px] text-center leading-tight max-w-[60px]">{step.label}</span>
          </div>
        ))}
      </div>
      {/* Connecting lines */}
      <div className="relative -top-3 mx-4">
        <div className="h-1 bg-gray-100 rounded-full">
          <div
            className="h-1 bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Default steps for create listing
export const listingSteps: Step[] = [
  { label: 'Chọn SP', icon: '📋' },
  { label: 'Chụp ảnh', icon: '📷' },
  { label: 'AI Phân tích', icon: '🤖' },
  { label: 'Kết quả', icon: '✅' },
  { label: 'Thông tin', icon: '📝' },
  { label: 'Giá', icon: '💰' },
  { label: 'Nội dung', icon: '📢' },
  { label: 'Đăng', icon: '🚀' },
];
