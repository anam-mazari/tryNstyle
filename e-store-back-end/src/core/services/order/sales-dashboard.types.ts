export enum SalesDashboardPeriod {
  TODAY = 'today',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
}

export interface SalesDashboardSeriesPoint {
  label: string;
  revenue: number;
  orderCount: number;
}

export interface SalesDashboardSummary {
  totalRevenue: number;
  ordersPlaced: number;
  pendingCount: number;
  cancelledCount: number;
}

export interface SalesDashboardResponse {
  period: SalesDashboardPeriod;
  startUtc: string;
  endUtc: string;
  summary: SalesDashboardSummary;
  series: SalesDashboardSeriesPoint[];
}
