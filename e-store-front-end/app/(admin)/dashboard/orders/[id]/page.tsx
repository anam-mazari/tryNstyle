'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useGetOrderQuery } from '@/store/api/ordersApi';
import { OrderDetails } from '@/features/orders/components/OrderDetails';

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { data: order, isLoading, error } = useGetOrderQuery(orderId);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-gray-900"></div>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href="/dashboard/orders"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Orders
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Order #{order.order_id.substring(0, 8)}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Status reflects checkout and payment automatically.
        </p>
      </div>

      <OrderDetails order={order} />
    </>
  );
}
