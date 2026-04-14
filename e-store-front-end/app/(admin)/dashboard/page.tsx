'use client';

import { useAuth } from '@/hooks/useAuth';
import { useGetProductsQuery } from '@/store/api/productsApi';
import { useGetOrdersQuery } from '@/store/api/ordersApi';
import { StatsCard } from '@/features/admin/components/StatsCard';
import { OrderLineThumbnails } from '@/features/orders/components/OrderProductThumbnail';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: products, isLoading: productsLoading } = useGetProductsQuery();
  const { data: orders, isLoading: ordersLoading } = useGetOrdersQuery();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {user?.name || user?.email}!</p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Products"
          value={productsLoading ? '...' : products?.length || 0}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatsCard
          title="Total Orders"
          value={ordersLoading ? '...' : orders?.length || 0}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatsCard
          title="Admin"
          value={user?.name || 'Admin'}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/products"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-medium text-gray-900">Manage Products</h3>
            <p className="mt-2 text-sm text-gray-600">
              View, create, and edit products
            </p>
          </Link>
          <Link
            href="/dashboard/orders"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-medium text-gray-900">Manage Orders</h3>
            <p className="mt-2 text-sm text-gray-600">
              View and process customer orders
            </p>
          </Link>
          <Link
            href="/dashboard/users"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-medium text-gray-900">Manage Users</h3>
            <p className="mt-2 text-sm text-gray-600">
              View and manage user accounts
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Recent Orders</h2>
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          {ordersLoading ? (
            <div className="p-8 text-center text-gray-500">Loading orders...</div>
          ) : orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.order_id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {order.order_id.substring(0, 8)}...
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <OrderLineThumbnails items={order.items ?? []} max={3} size={36} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <OrderStatusBadge status={order.order_status} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        ${Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">No orders yet</div>
          )}
        </div>
      </div>
    </>
  );
}
