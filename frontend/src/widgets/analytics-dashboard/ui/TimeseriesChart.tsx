
import { useReducedMotion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { TimeseriesPoint } from "@/entities/analytics";
import { chartTheme, tooltipLabelStyle, tooltipStyle } from "@/shared/config/chartTheme";

import { ChartCard } from "./ChartCard";
import { SeriesLegend } from "./SeriesLegend";
import styles from "./dashboard.module.scss";

function shortDate(iso: string): string {
  const parts = iso.split("-");
  return parts.length === 3 ? `${parts[2]}.${parts[1]}` : iso;
}

export function TimeseriesChart({ data }: { data: TimeseriesPoint[] }) {
  const animate = !useReducedMotion();
  return (
    <ChartCard title="Динамика по дням" subtitle="Отгрузка и просрочка, шт">
      {data.length === 0 ? (
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
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradShipped" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartTheme.shipped} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={chartTheme.shipped} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradExpired" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartTheme.expired} stopOpacity={0.24} />
                    <stop offset="100%" stopColor={chartTheme.expired} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fontSize: 12, fill: chartTheme.axis }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
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
                  labelFormatter={shortDate}
                />
                <Area
                  type="monotone"
                  dataKey="shipped"
                  name="Отгрузка"
                  stroke={chartTheme.shipped}
                  strokeWidth={2.5}
                  fill="url(#gradShipped)"
                  dot={{ r: 3, fill: chartTheme.shipped, strokeWidth: 0 }}
                  isAnimationActive={animate} animationDuration={400}
                />
                <Area
                  type="monotone"
                  dataKey="expired"
                  name="Просрочка"
                  stroke={chartTheme.expired}
                  strokeWidth={2}
                  fill="url(#gradExpired)"
                  dot={{ r: 3, fill: chartTheme.expired, strokeWidth: 0 }}
                  isAnimationActive={animate} animationDuration={400}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </ChartCard>
  );
}
