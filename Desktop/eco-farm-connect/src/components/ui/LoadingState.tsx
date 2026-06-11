import React from 'react';

export const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Đang tải...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <svg className="animate-spin h-8 w-8 text-primary-600 mb-3" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="card space-y-3">
      <div className="skeleton h-32 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-8 w-full" />
    </div>
  );
};
