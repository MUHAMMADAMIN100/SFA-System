import { motion } from "framer-motion";
import { Users } from "lucide-react";

import { ManagerKpi } from "@/entities/analytics";
import { fadeUp, stagger } from "@/shared/config/motion";
import { formatNumber } from "@/shared/lib/format";
import { EmptyState, PercentBadge, Table } from "@/shared/ui";

export function KpiManagersTable({ rows }: { rows: ManagerKpi[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Нет данных"
        description="За выбранный период визитов менеджеров нет."
      />
    );
  }

  return (
    <Table>
      <thead>
        <tr>
          <th>Менеджер</th>
          <th>Магазинов посещено</th>
          <th>Отгрузка (шт)</th>
          <th>Просрочка (шт)</th>
          <th>% просрочки</th>
        </tr>
      </thead>
      <motion.tbody variants={stagger} initial="initial" animate="animate">
        {rows.map((r) => (
          <motion.tr key={r.manager_id} variants={fadeUp}>
            <td>{r.manager_name}</td>
            <td>{formatNumber(r.stores_visited)}</td>
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
