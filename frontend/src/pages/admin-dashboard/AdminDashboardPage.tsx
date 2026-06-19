import { lazy, Suspense, useEffect, useState } from "react";

import {
  DateRange,
  fetchManagersKpi,
  fetchProductsKpi,
  fetchSummary,
  fetchTimeseries,
  ManagerKpi,
  ProductKpi,
  SummaryMetrics,
  TimeseriesPoint,
} from "@/entities/analytics";
import { PeriodFilter } from "@/features/analytics-filters";
import { PageHeader, useToast } from "@/shared/ui";
import { StatCards } from "@/widgets/analytics-dashboard/ui/StatCards";
import {
  ChartsSkeleton,
  DashboardSkeleton,
} from "@/widgets/analytics-dashboard/ui/DashboardSkeleton";

import styles from "./dashboard.module.scss";

// Тяжёлые графики (recharts) грузим отдельным чанком.
const DashboardCharts = lazy(() =>
  import("@/widgets/analytics-dashboard/ui/DashboardCharts").then((m) => ({
    default: m.DashboardCharts,
  }))
);

export function AdminDashboardPage() {
  const { showToast } = useToast();
  const [range, setRange] = useState<DateRange>({});
  const [summary, setSummary] = useState<SummaryMetrics | null>(null);
  const [series, setSeries] = useState<TimeseriesPoint[]>([]);
  const [managers, setManagers] = useState<ManagerKpi[]>([]);
  const [products, setProducts] = useState<ProductKpi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      fetchSummary(range),
      fetchTimeseries(range),
      fetchManagersKpi(range),
      fetchProductsKpi(range),
    ])
      .then(([s, t, m, p]) => {
        if (!active) return;
        setSummary(s);
        setSeries(t);
        setManagers(m);
        setProducts(p);
      })
      .catch(() => active && showToast("Не удалось загрузить аналитику", "error"))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [range, showToast]);

  return (
    <>
      <PageHeader title="Дашборд" />

      <div className={styles.filterBar}>
        <PeriodFilter onChange={setRange} />
      </div>

      {loading || !summary ? (
        <DashboardSkeleton />
      ) : (
        <>
          <StatCards data={summary} />
          <Suspense fallback={<ChartsSkeleton />}>
            <DashboardCharts series={series} managers={managers} products={products} />
          </Suspense>
        </>
      )}
    </>
  );
}
