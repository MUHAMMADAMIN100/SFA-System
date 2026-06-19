import { useReducedMotion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ManagerKpi } from "@/entities/analytics";
import { chartTheme, tooltipStyle } from "@/shared/config/chartTheme";
import { formatPercent } from "@/shared/lib/format";

import { ChartCard } from "./ChartCard";
import { SeriesLegend } from "./SeriesLegend";
import styles from "./dashboard.module.scss";

const THRESHOLD = 10;

export function ExpiredRateChart({ data }: { data: ManagerKpi[] }) {
  const animate = !useReducedMotion();
  const rows = [...data]
    .map((m) => ({ name: m.manager_name, pct: m.expired_percent }))
    .sort((a, b) => b.pct - a.pct);

  // Домен всегда включает порог, иначе референс-линия исчезает, когда все < 10%.
  const maxPct = Math.max(THRESHOLD, ...rows.map((r) => r.pct));
  const domainMax = Math.ceil(maxPct * 1.1);

  return (
    <ChartCard title="% просрочки по менеджерам" subtitle={`порог ${THRESHOLD}%`}>
      {rows.length === 0 ? (
        <div className={styles.empty}>Нет данных за период</div>
      ) : (
        <>
          <SeriesLegend
            items={[
              { name: "ниже порога", dotClass: "dotShipped" },
              { name: "выше порога", dotClass: "dotExpired" },
            ]}
          />
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rows}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartTheme.grid}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  unit="%"
                  domain={[0, domainMax]}
                  tick={{ fontSize: 12, fill: chartTheme.axis }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fontSize: 12, fill: chartTheme.axis }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => [formatPercent(v), "Просрочка"]}
                  cursor={{ fill: "rgba(28,109,176,0.06)" }}
                />
                <ReferenceLine
                  x={THRESHOLD}
                  stroke={chartTheme.threshold}
                  strokeDasharray="4 4"
                  ifOverflow="extendDomain"
                />
                <Bar
                  dataKey="pct"
                  radius={[0, 5, 5, 0]}
                  maxBarSize={26}
                  isAnimationActive={animate} animationDuration={400}
                >
                  {rows.map((r, i) => (
                    <Cell
                      key={i}
                      fill={r.pct >= THRESHOLD ? chartTheme.expired : chartTheme.shipped}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </ChartCard>
  );
}
