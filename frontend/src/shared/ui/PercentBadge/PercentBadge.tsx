import { formatPercent } from "@/shared/lib/format";

import styles from "./PercentBadge.module.scss";

// Цветовая индикация доли просрочки.
function levelFor(value: number): string {
  if (value <= 0) return "ok";
  if (value < 5) return "low";
  if (value < 15) return "mid";
  return "high";
}

export function PercentBadge({ value }: { value: number }) {
  return (
    <span className={`${styles.badge} ${styles[levelFor(value)]}`}>
      {formatPercent(value)}
    </span>
  );
}
