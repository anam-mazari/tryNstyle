'use client';

import type { SalesDashboardSeriesPoint } from '@/types/sales-dashboard';

interface SalesRevenueBarChartProps {
  readonly series: SalesDashboardSeriesPoint[];
  readonly isLoading: boolean;
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function isIsoDayLabel(label: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(label);
}

function isHourLabel(label: string): boolean {
  return /^\d{2}:\d{2}$/.test(label);
}

function formatHourLabelAmPm(label: string): string {
  const parts = label.split(':');
  const hour24 = Number(parts[0]);
  if (!Number.isFinite(hour24)) {
    return label;
  }
  const hour12 = ((hour24 + 11) % 12) + 1;
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour12} ${suffix}`;
}

function formatAxisLabel(label: string): string {
  if (isIsoDayLabel(label)) {
    const date = new Date(`${label}T00:00:00.000Z`);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
    }).format(date);
  }
  if (isHourLabel(label)) {
    return formatHourLabelAmPm(label);
  }
  return label;
}

export function SalesRevenueBarChart({
  series,
  isLoading,
}: SalesRevenueBarChartProps) {
  const maxRevenue = Math.max(
    1,
    ...series.map((point) => point.revenue),
  );

  /** Match Tailwind h-52 (13rem) so bar sizes are px-based; avoids % height bugs in flex. */
  const chartInnerHeightPx = 208;

  if (isLoading) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
        Loading chart…
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-500">
        No sales in this range yet.
      </div>
    );
  }

  const firstLabel = series[0]?.label ?? '';
  const isHourlySeries = series.length === 24 && isHourLabel(firstLabel);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="mb-4 text-sm font-medium text-gray-700">Revenue by period bucket</p>
      {/*
        Row uses items-stretch so each column is full chart height. Bar height is in px
        (share of max revenue) — percentage heights do not work when the row used items-end
        because columns had no definite height, so all bars were invisible.
      */}
      <div className="flex h-52 min-h-52 items-stretch gap-0.5 sm:gap-1">
        {series.map((point) => {
          const barHeightPx =
            point.revenue > 0
              ? Math.max(
                  3,
                  (point.revenue / maxRevenue) * chartInnerHeightPx,
                )
              : 0;
          const title = `${point.label}: ${formatUsd(point.revenue)} · ${point.orderCount} orders`;
          return (
            <div
              key={point.label}
              className="group flex min-h-0 min-w-0 flex-1 flex-col justify-end"
              title={title}
            >
              <div
                className="mx-auto w-full max-w-[14px] rounded-t bg-blue-500 transition-colors group-hover:bg-blue-600 sm:max-w-[20px]"
                style={{ height: barHeightPx }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between gap-1 overflow-x-auto text-[10px] text-gray-500 sm:text-xs">
        {series.map((point, index) => {
          const isHourly = isHourlySeries;
          const isDaily = !isHourly && isIsoDayLabel(firstLabel);
          const showLabel =
            series.length <= 12 ||
            index === 0 ||
            index === series.length - 1 ||
            (isHourly && index % 4 === 0) ||
            (isDaily && series.length > 12 && series.length <= 31 && index % 5 === 0) ||
            (isDaily && series.length > 31 && index % 7 === 0);
          return (
            <span
              key={`lbl-${point.label}`}
              className={`min-w-0 flex-1 text-center ${showLabel ? 'whitespace-nowrap' : ''}`}
            >
              {showLabel ? formatAxisLabel(point.label) : '·'}
            </span>
          );
        })}
      </div>
    </div>
  );
}
