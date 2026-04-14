'use client';

import { Badge } from '@/components/ui/Badge';

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'paid':
        return 'success';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const label =
    status.length > 0 ? status.charAt(0).toUpperCase() + status.slice(1) : status;

  return (
    <Badge variant={getVariant(status)}>
      {label}
    </Badge>
  );
}




