import { api } from "@/shared/api";

import {
  DateRange,
  ManagerKpi,
  ProductKpi,
  SummaryMetrics,
  TimeseriesPoint,
} from "../model/types";

export async function fetchSummary(range: DateRange): Promise<SummaryMetrics> {
  const { data } = await api.get<SummaryMetrics>("/analytics/summary/", {
    params: range,
  });
  return data;
}

export async function fetchTimeseries(
  range: DateRange
): Promise<TimeseriesPoint[]> {
  const { data } = await api.get<TimeseriesPoint[]>("/analytics/timeseries/", {
    params: range,
  });
  return data;
}

export async function fetchManagersKpi(range: DateRange): Promise<ManagerKpi[]> {
  const { data } = await api.get<ManagerKpi[]>("/analytics/managers/", {
    params: range,
  });
  return data;
}

export async function fetchProductsKpi(range: DateRange): Promise<ProductKpi[]> {
  const { data } = await api.get<ProductKpi[]>("/analytics/products/", {
    params: range,
  });
  return data;
}

export async function downloadVisitsExport(range: DateRange): Promise<void> {
  const { data } = await api.get("/export/visits/", {
    params: range,
    responseType: "blob",
  });
  const url = URL.createObjectURL(data as Blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "visits.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
