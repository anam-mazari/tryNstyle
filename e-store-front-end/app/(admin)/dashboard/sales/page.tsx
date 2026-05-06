'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SalesDashboardPeriod } from '@/types/sales-dashboard';
import {
  SALES_DASHBOARD_PERIOD_LABELS,
  SALES_DASHBOARD_PERIOD_OPTIONS,
} from '@/constants/sales-dashboard';
import { useGetSalesDashboardQuery } from '@/store/api/ordersApi';
import { StatsCard } from '@/features/admin/components/StatsCard';
import { SalesRevenueBarChart } from '@/features/admin/components/SalesRevenueBarChart';
import { SalesOrderStatusBreakdown } from '@/features/admin/components/SalesOrderStatusBreakdown';
import { getRtkErrorMessage } from '@/utils/get-rtk-error-message';

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function AdminSalesPage() {
  const [period, setPeriod] = useState<SalesDashboardPeriod>(
    SalesDashboardPeriod.LAST_WEEK,
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetSalesDashboardQuery(period);

  const chartLoading = isLoading || isFetching;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="mt-2 text-gray-600">
            Revenue trend and order status for the window you select (UTC calendar boundaries).
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to dashboard
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {SALES_DASHBOARD_PERIOD_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPeriod(option)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              period === option
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {SALES_DASHBOARD_PERIOD_LABELS[option]}
          </button>
        ))}
      </div>

      {isError ? (
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">Unable to load sales dashboard</p>
          <p className="mt-2 whitespace-pre-wrap text-red-700">
            {getRtkErrorMessage(error, 'Request failed')}
          </p>
          <p className="mt-2 text-xs text-red-600">
            Confirm the API exposes{' '}
            <code className="rounded bg-red-100 px-1">GET /reports/sales-dashboard?period=…</code>{' '}
            and rebuild or restart the Nest server (e.g. Docker backend image).
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 rounded-md bg-red-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Revenue (range)"
              value={chartLoading ? '…' : formatUsd(data?.summary.totalRevenue ?? 0)}
              iconClassName="bg-blue-500"
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Orders placed"
              value={chartLoading ? '…' : (data?.summary.ordersPlaced ?? 0)}
              iconClassName="bg-indigo-500"
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Pending"
              value={chartLoading ? '…' : (data?.summary.pendingCount ?? 0)}
              className="ring-1 ring-amber-100"
              iconClassName="bg-amber-500"
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <StatsCard
              title="Cancelled"
              value={chartLoading ? '…' : (data?.summary.cancelledCount ?? 0)}
              className="ring-1 ring-red-100"
              iconClassName="bg-red-500"
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              }
            />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SalesRevenueBarChart
              series={data?.series ?? []}
              isLoading={chartLoading}
            />
            <SalesOrderStatusBreakdown
              summary={
                data?.summary ?? {
                  totalRevenue: 0,
                  ordersPlaced: 0,
                  pendingCount: 0,
                  cancelledCount: 0,
                }
              }
              isLoading={chartLoading}
            />
          </div>

          {!chartLoading && data ? (
            <p className="text-xs text-gray-500">
              Window: {new Date(data.startUtc).toISOString().slice(0, 10)} →{' '}
              {new Date(data.endUtc).toISOString().slice(0, 10)} (UTC)
            </p>
          ) : null}
        </>
      )}
    </>
  );
}
