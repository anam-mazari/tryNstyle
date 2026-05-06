import { SalesDashboardPeriod } from '@/types/sales-dashboard';

export const SALES_DASHBOARD_PERIOD_OPTIONS: readonly SalesDashboardPeriod[] = [
  SalesDashboardPeriod.TODAY,
  SalesDashboardPeriod.LAST_WEEK,
  SalesDashboardPeriod.LAST_MONTH,
] as const;

export const SALES_DASHBOARD_PERIOD_LABELS: Record<SalesDashboardPeriod, string> = {
  [SalesDashboardPeriod.TODAY]: 'Today',
  [SalesDashboardPeriod.LAST_WEEK]: 'Last week',
  [SalesDashboardPeriod.LAST_MONTH]: 'Last month',
};
