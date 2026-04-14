'use client';

import Link from 'next/link';
import { OrderLineThumbnails } from '@/features/orders/components/OrderProductThumbnail';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import type { Order } from '@/types/entities';

interface OrderCardProps {
  order: Order;
  showLink?: boolean;
}

export function OrderCard({ order, showLink = true }: OrderCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          {showLink ? (
            <Link
              href={`/profile/orders/${order.order_id}`}
              className="text-lg font-semibold text-gray-900 hover:text-gray-700"
            >
              Order #{order.order_id.substring(0, 8)}
            </Link>
          ) : (
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.order_id.substring(0, 8)}
            </h3>
          )}
          <p className="mt-1 text-sm text-gray-600">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">
            ${Number(order.total_amount).toFixed(2)}
          </p>
          <div className="mt-2">
            <OrderStatusBadge status={order.order_status} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {order.items?.length || 0} item(s)
          </span>
          {order.items && order.items.length > 0 && (
            <OrderLineThumbnails items={order.items} max={4} size={44} />
          )}
        </div>
      </div>
    </div>
  );
}




