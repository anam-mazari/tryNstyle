'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetOrdersQuery } from '@/store/api/ordersApi';
import { OrderCard } from '@/features/orders/components/OrderCard';
import Link from 'next/link';

export default function OrdersPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  if (!auth.isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Please log in</h2>
          <Link
            href="/login"
            className="rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
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
            <p className="mt-2 text-sm text-gray-600">Please try again later</p>
          </div>
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.order_id} order={order} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-600">No orders yet</p>
            <p className="mt-2 text-sm text-gray-500">Start shopping to see your orders here</p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
            >
              Browse Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

