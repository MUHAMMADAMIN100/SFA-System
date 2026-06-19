import styles from "./dashboard.module.scss";

interface LegendItem {
  name: string;
  dotClass: string;
}

export function SeriesLegend({ items }: { items: LegendItem[] }) {
  return (
    <div className={styles.seriesLegend}>
      {items.map((it) => (
        <span key={it.name} className={styles.seriesItem}>
          <span className={`${styles.legendDot} ${styles[it.dotClass]}`} />
          {it.name}
        </span>
      ))}
    </div>
  );
}
