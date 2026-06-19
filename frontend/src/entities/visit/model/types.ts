export interface VisitItem {
  id: number;
  product: number;
  product_name: string;
  product_volume: string;
  shipped_qty: number;
  expired_qty: number;
}

export interface Visit {
  id: number;
  manager: number;
  manager_name: string;
  store: number;
  store_name: string;
  created_at: string;
  invoice_photo: string;
  items: VisitItem[];
}

export interface VisitItemInput {
  product: number;
  shipped_qty: number;
  expired_qty: number;
}

export interface CreateVisitPayload {
  store: number;
  items: VisitItemInput[];
  photo: File;
}

export interface VisitFilters {
  date_from?: string;
  date_to?: string;
  manager?: number;
  store?: number;
  page?: number;
}
