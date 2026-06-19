import { useEffect, useState } from "react";

import { DateRange, fetchManagersKpi, ManagerKpi } from "@/entities/analytics";
import { PeriodFilter } from "@/features/analytics-filters";
import { PageHeader, TableSkeleton, useToast } from "@/shared/ui";
import { KpiManagersTable } from "@/widgets/kpi-managers-table";

import styles from "./managers.module.scss";

export function AdminManagersPage() {
  const { showToast } = useToast();
  const [range, setRange] = useState<DateRange>({});
  const [rows, setRows] = useState<ManagerKpi[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchManagersKpi(range)
      .then(setRows)
      .catch(() => showToast("Не удалось загрузить KPI", "error"))
      .finally(() => setLoading(false));
  }, [range, showToast]);

  return (
    <>
      <PageHeader title="KPI менеджеров" />
      <div className={styles.filters}>
        <PeriodFilter onChange={setRange} />
      </div>
      {loading ? <TableSkeleton rows={4} cols={5} /> : <KpiManagersTable rows={rows} />}
    </>
  );
}
