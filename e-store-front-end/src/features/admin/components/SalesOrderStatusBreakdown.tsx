'use client';

import type { SalesDashboardSummary } from '@/types/sales-dashboard';

interface SalesOrderStatusBreakdownProps {
  readonly summary: SalesDashboardSummary;
  readonly isLoading: boolean;
}

function computeOtherOrders(summary: SalesDashboardSummary): number {
  const remainder =
    summary.ordersPlaced - summary.pendingCount - summary.cancelledCount;
  return remainder > 0 ? remainder : 0;
}

export function SalesOrderStatusBreakdown({
  summary,
  isLoading,
}: SalesOrderStatusBreakdownProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
        Loading status breakdown…
      </div>
    );
  }

  const otherOrders = computeOtherOrders(summary);
  const totalForBar = Math.max(
    1,
    summary.pendingCount + summary.cancelledCount + otherOrders,
  );

  const pendingWidth = (summary.pendingCount / totalForBar) * 100;
  const cancelledWidth = (summary.cancelledCount / totalForBar) * 100;
  const otherWidth = (otherOrders / totalForBar) * 100;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-semibold text-gray-900">Orders by status (this range)</h3>
      <p className="mt-1 text-xs text-gray-500">
        Counts are for orders placed in the selected window, grouped by their current status.
      </p>
      <div className="mt-4 flex h-10 w-full overflow-hidden rounded-md ring-1 ring-gray-200">
        <div
          className="bg-amber-400"
          style={{ width: `${pendingWidth}%` }}
          title={`Pending: ${summary.pendingCount}`}
        />
        <div
          className="bg-red-500"
          style={{ width: `${cancelledWidth}%` }}
          title={`Cancelled: ${summary.cancelledCount}`}
        />
        <div
          className="bg-emerald-500"
          style={{ width: `${otherWidth}%` }}
          title={`Other (paid / shipped / etc.): ${otherOrders}`}
        />
      </div>
      <ul className="mt-4 flex flex-wrap gap-4 text-sm">
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-amber-400" />
          <span className="text-gray-700">Pending</span>
          <span className="font-semibold text-gray-900">{summary.pendingCount}</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-red-500" />
          <span className="text-gray-700">Cancelled</span>
          <span className="font-semibold text-gray-900">{summary.cancelledCount}</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-emerald-500" />
          <span className="text-gray-700">Other</span>
          <span className="font-semibold text-gray-900">{otherOrders}</span>
        </li>
      </ul>
    </div>
  );
}
