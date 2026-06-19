import {
  ManagerKpi,
  ProductKpi,
  TimeseriesPoint,
} from "@/entities/analytics";

import { ExpiredRateChart } from "./ExpiredRateChart";
import { ManagersBarChart } from "./ManagersBarChart";
import { ProductsDonut } from "./ProductsDonut";
import { TimeseriesChart } from "./TimeseriesChart";
import { TopExpiredProducts } from "./TopExpiredProducts";
import styles from "./dashboard.module.scss";

interface DashboardChartsProps {
  series: TimeseriesPoint[];
  managers: ManagerKpi[];
  products: ProductKpi[];
}

// Тяжёлые графики (recharts) — отдельным lazy-чанком (см. AdminDashboardPage).
export function DashboardCharts({ series, managers, products }: DashboardChartsProps) {
  return (
    <>
      <TimeseriesChart data={series} />
      <div className={styles.grid2}>
        <ManagersBarChart data={managers} />
        <ExpiredRateChart data={managers} />
      </div>
      <div className={styles.grid2}>
        <ProductsDonut data={products} />
        <TopExpiredProducts data={products} />
      </div>
    </>
  );
}
