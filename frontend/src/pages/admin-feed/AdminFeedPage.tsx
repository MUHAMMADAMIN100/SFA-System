import { Download, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { DateRange, downloadVisitsExport } from "@/entities/analytics";
import { fetchManagers, Manager } from "@/entities/user";
import { fetchVisits, Visit } from "@/entities/visit";
import { PeriodFilter } from "@/features/analytics-filters";
import { Button, PageHeader, Select, TableSkeleton, useToast } from "@/shared/ui";
import { VisitFeedTable } from "@/widgets/visit-feed-table";

import styles from "./feed.module.scss";

const PAGE_SIZE = 20;

export function AdminFeedPage() {
  const { showToast } = useToast();
  const [range, setRange] = useState<DateRange>({});
  const [managerId, setManagerId] = useState<number | "">("");
  const [managers, setManagers] = useState<Manager[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchManagers()
      .then(setManagers)
      .catch(() => showToast("Не удалось загрузить список менеджеров", "error"));
  }, [showToast]);

  const load = useCallback(() => {
    setLoading(true);
    fetchVisits({ ...range, manager: managerId || undefined, page })
      .then((data) => {
        setVisits(data.results);
        setCount(data.count);
      })
      .catch(() => showToast("Не удалось загрузить визиты", "error"))
      .finally(() => setLoading(false));
  }, [range, managerId, page, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function onExport() {
    setExporting(true);
    try {
      await downloadVisitsExport(range);
    } catch {
      showToast("Не удалось выгрузить файл", "error");
    } finally {
      setExporting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Лента визитов"
        actions={
          <>
            <Button
              variant="secondary"
              icon={<RefreshCw size={16} aria-hidden />}
              onClick={load}
            >
              Обновить
            </Button>
            <Button
              icon={<Download size={16} aria-hidden />}
              onClick={onExport}
              loading={exporting}
            >
              Экспорт в Excel
            </Button>
          </>
        }
      />

      <div className={styles.filters}>
        <PeriodFilter
          onChange={(r) => {
            setRange(r);
            setPage(1);
          }}
        />
        <Select
          label="Менеджер"
          value={managerId}
          onChange={(e) => {
            setManagerId(e.target.value ? Number(e.target.value) : "");
            setPage(1);
          }}
        >
          <option value="">Все менеджеры</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name || m.username}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <VisitFeedTable visits={visits} />
      )}

      <div className={styles.pager}>
        <span className={styles.count}>Всего визитов: {count}</span>
        <div className={styles.pageNav}>
          <Button
            variant="secondary"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Назад
          </Button>
          <span className={styles.pageInfo}>
            Стр. {page} из {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Вперёд
          </Button>
        </div>
      </div>
    </>
  );
}
