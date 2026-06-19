import { ProductKpi } from "@/entities/analytics";
import { formatNumber } from "@/shared/lib/format";
import { PercentBadge } from "@/shared/ui";

import { ChartCard } from "./ChartCard";
import styles from "./dashboard.module.scss";

export function TopExpiredProducts({ data }: { data: ProductKpi[] }) {
  const rows = [...data]
    .filter((p) => p.shipped_total > 0)
    .sort((a, b) => b.expired_percent - a.expired_percent)
    .slice(0, 6);

  return (
    <ChartCard title="Топ товаров по % просрочки">
      {rows.length === 0 ? (
        <div className={styles.empty}>Нет данных за период</div>
      ) : (
        <div className={styles.topList}>
          {rows.map((p) => (
            <div key={p.product_id} className={styles.topRow}>
              <span className={styles.topName}>
                {p.product_name} ({p.product_volume})
              </span>
              <span className={styles.topMeta}>
                <span className={styles.topQty}>
                  {formatNumber(p.expired_total)} / {formatNumber(p.shipped_total)} шт
                </span>
                <PercentBadge value={p.expired_percent} />
              </span>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  );
}
