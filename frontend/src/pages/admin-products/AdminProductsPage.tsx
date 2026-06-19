import { useEffect, useState } from "react";

import { DateRange, fetchProductsKpi, ProductKpi } from "@/entities/analytics";
import { PeriodFilter } from "@/features/analytics-filters";
import { PageHeader, TableSkeleton, useToast } from "@/shared/ui";
import { KpiProductsTable } from "@/widgets/kpi-products-table";

import styles from "./products.module.scss";

export function AdminProductsPage() {
  const { showToast } = useToast();
  const [range, setRange] = useState<DateRange>({});
  const [rows, setRows] = useState<ProductKpi[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProductsKpi(range)
      .then(setRows)
      .catch(() => showToast("Не удалось загрузить аналитику", "error"))
      .finally(() => setLoading(false));
  }, [range, showToast]);

  return (
    <>
      <PageHeader title="Аналитика по товарам" />
      <div className={styles.filters}>
        <PeriodFilter onChange={setRange} />
      </div>
      {loading ? <TableSkeleton rows={4} cols={4} /> : <KpiProductsTable rows={rows} />}
    </>
  );
}
