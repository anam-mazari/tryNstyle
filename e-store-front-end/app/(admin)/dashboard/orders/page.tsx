'use client';

import { useGetOrdersQuery } from '@/store/api/ordersApi';
import { OrderTable } from '@/features/admin/components/OrderTable';

export default function AdminOrdersPage() {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="mt-2 text-gray-600">
          Status updates automatically as the order moves through checkout and payment (e.g., pending → paid → delivered).
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-gray-900"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">Error loading orders</p>
          </div>
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <OrderTable orders={orders} />
        </div>
      ) : (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-600">No orders found</p>
          </div>
        </div>
      )}
    </>
  );
}
