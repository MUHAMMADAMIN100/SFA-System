export interface ManagerKpi {
  manager_id: number;
  manager_name: string;
  stores_visited: number;
  shipped_total: number;
  expired_total: number;
  expired_percent: number;
}

export interface ProductKpi {
  product_id: number;
  product_name: string;
  product_volume: string;
  shipped_total: number;
  expired_total: number;
  expired_percent: number;
}

export interface DateRange {
  date_from?: string;
  date_to?: string;
}

export interface SummaryMetrics {
  shipped_total: number;
  expired_total: number;
  expired_percent: number;
  stores_visited: number;
  active_managers: number;
}

export interface TimeseriesPoint {
  date: string;
  shipped: number;
  expired: number;
}
