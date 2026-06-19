import { motion } from "framer-motion";
import { Package } from "lucide-react";

import { ProductKpi } from "@/entities/analytics";
import { fadeUp, stagger } from "@/shared/config/motion";
import { formatNumber } from "@/shared/lib/format";
import { EmptyState, PercentBadge, Table } from "@/shared/ui";

export function KpiProductsTable({ rows }: { rows: ProductKpi[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Нет данных"
        description="За выбранный период отгрузок по товарам нет."
      />
    );
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Товар</th>
          <th>Отгружено (шт)</th>
          <th>Просрочка (шт)</th>
          <th>% просрочки</th>
        </tr>
      </thead>
      <motion.tbody variants={stagger} initial="initial" animate="animate">
        {rows.map((r) => (
          <motion.tr key={r.product_id} variants={fadeUp}>
            <td>
              {r.product_name} ({r.product_volume})
            </td>
            <td>{formatNumber(r.shipped_total)}</td>
            <td>{formatNumber(r.expired_total)}</td>
            <td>
              <PercentBadge value={r.expired_percent} />
            </td>
          </motion.tr>
        ))}
      </motion.tbody>
    </Table>
  );
}
