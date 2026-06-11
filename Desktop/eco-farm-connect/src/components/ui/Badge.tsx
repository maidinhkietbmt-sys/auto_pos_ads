import React from 'react';

type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantMap: Record<BadgeVariant, string> = {
  green: 'badge-green',
  yellow: 'badge-yellow',
  red: 'badge-red',
  blue: 'badge-blue',
  gray: 'badge-gray',
};

const dotColors: Record<BadgeVariant, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  gray: 'bg-gray-400',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'gray', children, className = '', dot = false }) => {
  return (
    <span className={`${variantMap[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} mr-1.5`} />}
      {children}
    </span>
  );
};

export const ConfidenceBadge: React.FC<{ score: number }> = ({ score }) => {
  const variant: BadgeVariant = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
  return (
    <Badge variant={variant}>
      AI: {score}%
    </Badge>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    active: { variant: 'green', label: 'Đang bán' },
    draft: { variant: 'gray', label: 'Nháp' },
    pending: { variant: 'yellow', label: 'Chờ duyệt' },
    sold: { variant: 'blue', label: 'Đã bán' },
    out_of_stock: { variant: 'red', label: 'Hết hàng' },
    new: { variant: 'blue', label: 'Mới' },
    negotiating: { variant: 'yellow', label: 'Đang trao đổi' },
    confirmed: { variant: 'green', label: 'Đã chốt' },
    completed: { variant: 'blue', label: 'Hoàn thành' },
    failed: { variant: 'red', label: 'Không thành công' },
  };
  const item = map[status] || { variant: 'gray' as BadgeVariant, label: status };
  return <Badge variant={item.variant} dot>{item.label}</Badge>;
};
