'use client';

import { Card } from '@/components/ui/Card';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderProductThumbnail } from './OrderProductThumbnail';
import type { Order } from '@/types/entities';
import { getOrderLineDisplayName } from '@/utils/product-labels';
import { getOrderLinePrimaryImageUrl } from '@/utils/product-color-variants';

interface OrderDetailsProps {
  order: Order;
}

function formatShippingAddress(order: Order): string[] {
  const lines: string[] = [];
  if (order.shipping_address) {
    lines.push(order.shipping_address);
  }
  if (order.shipping_address_line2) {
    lines.push(order.shipping_address_line2);
  }
  const cityLine = [
    order.shipping_city,
    order.shipping_province,
    order.shipping_postal_code,
  ]
    .filter(Boolean)
    .join(', ');
  if (cityLine) {
    lines.push(cityLine);
  }
  if (order.shipping_country) {
    lines.push(order.shipping_country);
  }
  return lines.length > 0 ? lines : [order.shipping_address || '—'];
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const addressLines = formatShippingAddress(order);
  const productLabel = (item: (typeof order.items)[0]) =>
    getOrderLineDisplayName(item.product ?? undefined);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <Card header={<h2 className="text-lg font-semibold text-gray-900">Order items</h2>}>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <OrderProductThumbnail
                    imageUrl={getOrderLinePrimaryImageUrl(item.product ?? undefined)}
                    alt={productLabel(item)}
                    size={72}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{productLabel(item)}</p>
                    <p className="text-sm text-gray-500">
                      Qty {item.quantity} × ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card header={<h2 className="text-lg font-semibold text-gray-900">Customer</h2>}>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="text-sm text-gray-900">{order.user?.username ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">{order.user?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="text-sm text-gray-900">{order.user?.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Profile address</dt>
              <dd className="text-sm text-gray-900">{order.user?.address ?? '—'}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card header={<h2 className="text-lg font-semibold text-gray-900">Order summary</h2>}>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <OrderStatusBadge status={order.order_status} />
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                ${Number(order.total_amount).toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Payment method</dt>
              <dd className="mt-1 text-sm text-gray-900">{order.payment_method}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Shipping address</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="space-y-1">
                  {addressLines.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Ordered at</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(order.created_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
