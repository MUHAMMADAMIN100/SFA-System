import { useReducedMotion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ProductKpi } from "@/entities/analytics";
import { chartTheme, tooltipStyle } from "@/shared/config/chartTheme";
import { formatNumber } from "@/shared/lib/format";

import { ChartCard } from "./ChartCard";
import styles from "./dashboard.module.scss";

const TOP_N = 5;
const CAT_CLASSES = ["cat0", "cat1", "cat2", "cat3", "cat4"];

// Метод наибольшего остатка: округлённые доли в сумме дают ровно 100%.
function apportion(values: number[], total: number): number[] {
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((v) => (v / total) * 100);
  const result = raw.map(Math.floor);
  let remainder = 100 - result.reduce((a, b) => a + b, 0);
  const byFrac = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < byFrac.length && remainder > 0; k++, remainder--) {
    result[byFrac[k].i] += 1;
  }
  return result;
}

export function ProductsDonut({ data }: { data: ProductKpi[] }) {
  const animate = !useReducedMotion();
  const sorted = [...data]
    .filter((p) => p.shipped_total > 0)
    .sort((a, b) => b.shipped_total - a.shipped_total);

  const top = sorted.slice(0, TOP_N);
  const restTotal = sorted.slice(TOP_N).reduce((s, p) => s + p.shipped_total, 0);

  type Slice = { name: string; value: number; color: string; dotClass: string };
  const slices: Slice[] = top.map((p, i) => ({
    name: `${p.product_name} (${p.product_volume})`,
    value: p.shipped_total,
    color: chartTheme.categorical[i],
    dotClass: CAT_CLASSES[i],
  }));
  if (restTotal > 0) {
    slices.push({
      name: "Прочее",
      value: restTotal,
      color: chartTheme.rest,
      dotClass: "catRest",
    });
  }

  const total = slices.reduce((s, x) => s + x.value, 0);
  const percents = apportion(
    slices.map((s) => s.value),
    total
  );

  return (
    <ChartCard title="Структура отгрузки по товарам" subtitle={`топ-${TOP_N} + прочее`}>
      {slices.length === 0 ? (
        <div className={styles.empty}>Нет данных за период</div>
      ) : (
        <div className={styles.donutLayout}>
          <div className={styles.donutChart}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={56}
                  outerRadius={86}
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={animate} animationDuration={400}
                >
                  {slices.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number, n: string) => [`${formatNumber(v)} шт`, n]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.donutCenter}>
              <span className={styles.donutTotal}>{formatNumber(total)}</span>
              <span className={styles.donutCaption}>шт отгружено</span>
            </div>
          </div>

          <div className={styles.legend}>
            {slices.map((s, i) => (
              <div key={s.name} className={styles.legendRow}>
                <span className={`${styles.legendDot} ${styles[s.dotClass]}`} />
                <span className={styles.legendName}>{s.name}</span>
                <span className={styles.legendVal}>{percents[i]}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
