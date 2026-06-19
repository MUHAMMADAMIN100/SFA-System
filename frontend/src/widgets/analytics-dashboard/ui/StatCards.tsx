import { motion } from "framer-motion";
import {
  AlertTriangle,
  LucideIcon,
  Package,
  Percent,
  Store,
  Users,
} from "lucide-react";

import { SummaryMetrics } from "@/entities/analytics";
import { fadeUp, stagger } from "@/shared/config/motion";
import { formatNumber, formatPercent } from "@/shared/lib/format";
import { CountUp } from "@/shared/ui";

import styles from "./dashboard.module.scss";

type Tone = "shipped" | "expired" | "neutral";
type Kind = "int" | "percent";

interface Stat {
  label: string;
  value: number;
  kind: Kind;
  tone: Tone;
  icon: LucideIcon;
}

export function StatCards({ data }: { data: SummaryMetrics }) {
  const stats: Stat[] = [
    { label: "Отгружено, шт", value: data.shipped_total, kind: "int", tone: "shipped", icon: Package },
    { label: "Просрочка, шт", value: data.expired_total, kind: "int", tone: "expired", icon: AlertTriangle },
    { label: "% просрочки", value: data.expired_percent, kind: "percent", tone: "expired", icon: Percent },
    { label: "Магазинов посещено", value: data.stores_visited, kind: "int", tone: "neutral", icon: Store },
    { label: "Активных менеджеров", value: data.active_managers, kind: "int", tone: "neutral", icon: Users },
  ];

  return (
    <motion.div
      className={styles.statsGrid}
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {stats.map((s) => (
        <motion.div
          key={s.label}
          variants={fadeUp}
          className={`${styles.statCard} ${styles[`tone_${s.tone}`]}`}
        >
          <span className={styles.statIcon}>
            <s.icon size={18} strokeWidth={1.75} aria-hidden />
          </span>
          <span className={styles.statValue}>
            {s.kind === "percent" ? (
              formatPercent(s.value)
            ) : (
              <CountUp value={s.value} format={(n) => formatNumber(Math.round(n))} />
            )}
          </span>
          <span className={styles.statLabel}>{s.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
