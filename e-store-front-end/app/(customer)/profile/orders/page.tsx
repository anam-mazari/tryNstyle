'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetGuestOrdersQuery, useGetMyOrdersQuery } from '@/store/api/ordersApi';
import { OrderCard } from '@/features/orders/components/OrderCard';
import Link from 'next/link';

export default function OrdersPage() {
  const customerAuth = useSelector((state: RootState) => state.customerAuth);
  const [guestEmail, setGuestEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const raw = localStorage.getItem('guestCheckoutEmail');
    const normalized = raw ? raw.trim().toLowerCase() : '';
    setGuestEmail(normalized.length > 0 ? normalized : null);
  }, []);

  const shouldUseAccountOrders = customerAuth.isAuthenticated;
  const shouldUseGuestOrders = !customerAuth.isAuthenticated && Boolean(guestEmail);

  const myOrdersQuery = useGetMyOrdersQuery(undefined, {
    skip: !shouldUseAccountOrders,
  });
  const guestOrdersQuery = useGetGuestOrdersQuery(
    { email: guestEmail ?? '' },
    { skip: !shouldUseGuestOrders },
  );

  const merged = useMemo(() => {
    if (shouldUseAccountOrders) {
      return {
        orders: myOrdersQuery.data,
        isLoading: myOrdersQuery.isLoading,
        error: myOrdersQuery.error,
      };
    }
    return {
      orders: guestOrdersQuery.data,
      isLoading: guestOrdersQuery.isLoading,
      error: guestOrdersQuery.error,
    };
  }, [
    guestOrdersQuery.data,
    guestOrdersQuery.error,
    guestOrdersQuery.isLoading,
    myOrdersQuery.data,
    myOrdersQuery.error,
    myOrdersQuery.isLoading,
    shouldUseAccountOrders,
  ]);

  const orders = merged.orders;
  const isLoading = merged.isLoading;
  const error = merged.error;

  const showGuestOrders = !customerAuth.isAuthenticated && Boolean(guestEmail);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order history</h1>
        <p className="mt-2 text-sm text-gray-600">
          {customerAuth.isAuthenticated
            ? 'Orders placed with your signed-in account (same email as checkout).'
            : showGuestOrders
              ? `Showing orders for ${guestEmail}.`
              : 'Sign in to see your account orders, or place an order to view it here.'}
        </p>
      </div>

      {!customerAuth.isAuthenticated && !showGuestOrders ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-900 transition-colors hover:bg-gray-50"
            >
              Register
            </Link>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-gray-900" />
            <p className="text-gray-600">Loading orders…</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">
              Could not load orders
            </p>
            <p className="mt-2 text-sm text-gray-600">Please try again later.</p>
          </div>
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.order_id}
              order={order}
              showLink={false}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-600">No orders yet</p>
            <p className="mt-2 text-sm text-gray-500">
              {customerAuth.isAuthenticated
                ? 'After you place an order with this account, it will appear here.'
                : 'After you place an order with this email, it will appear here.'}
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-md bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
            >
              Browse products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
