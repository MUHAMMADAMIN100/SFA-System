
import { useReducedMotion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ManagerKpi } from "@/entities/analytics";
import { chartTheme, tooltipLabelStyle, tooltipStyle } from "@/shared/config/chartTheme";

import { ChartCard } from "./ChartCard";
import { SeriesLegend } from "./SeriesLegend";
import styles from "./dashboard.module.scss";

export function ManagersBarChart({ data }: { data: ManagerKpi[] }) {
  const animate = !useReducedMotion();
  const rows = data.map((m) => ({
    name: m.manager_name,
    shipped: m.shipped_total,
    expired: m.expired_total,
  }));

  return (
    <ChartCard title="Отгрузка и просрочка по менеджерам" subtitle="шт">
      {rows.length === 0 ? (
        <div className={styles.empty}>Нет данных за период</div>
      ) : (
        <>
          <SeriesLegend
            items={[
              { name: "Отгрузка", dotClass: "dotShipped" },
              { name: "Просрочка", dotClass: "dotExpired" },
            ]}
          />
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: chartTheme.axis }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: chartTheme.axis }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabelStyle}
                  cursor={{ fill: "rgba(28,109,176,0.06)" }}
                />
                <Bar dataKey="shipped" name="Отгрузка" fill={chartTheme.shipped} radius={[5, 5, 0, 0]} maxBarSize={34} isAnimationActive={animate} animationDuration={400} />
                <Bar dataKey="expired" name="Просрочка" fill={chartTheme.expired} radius={[5, 5, 0, 0]} maxBarSize={34} isAnimationActive={animate} animationDuration={400} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </ChartCard>
  );
}
