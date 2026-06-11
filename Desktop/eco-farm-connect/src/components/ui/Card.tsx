import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hover = false }) => {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      className={`${hover || onClick ? 'card-hover' : 'card'} ${className}`}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

interface KPICardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: { value: string; isUp: boolean };
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
}

const colorMap = {
  green: 'bg-green-50 border-green-200',
  blue: 'bg-blue-50 border-blue-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  red: 'bg-red-50 border-red-200',
  purple: 'bg-purple-50 border-purple-200',
};

const iconColorMap = {
  green: 'text-green-600',
  blue: 'text-blue-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
  purple: 'text-purple-600',
};

export const KPICard: React.FC<KPICardProps> = ({ label, value, icon, trend, color = 'green' }) => {
  return (
    <div className={`rounded-xl p-4 border ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${trend.isUp ? 'text-green-600' : 'text-red-500'}`}>
              <span>{trend.isUp ? '↑' : '↓'}</span>
              {trend.value}
            </p>
          )}
        </div>
        {icon && <span className={`text-2xl ${iconColorMap[color]}`}>{icon}</span>}
      </div>
    </div>
  );
};
