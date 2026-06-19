import { Skeleton } from "@/shared/ui";

import styles from "./dashboard.module.scss";

function ChartBlock() {
  return (
    <section className={styles.card}>
      <div className={styles.skChart}>
        <Skeleton variant="block" />
      </div>
    </section>
  );
}

export function ChartsSkeleton() {
  return (
    <>
      <ChartBlock />
      <div className={styles.grid2}>
        <ChartBlock />
        <ChartBlock />
      </div>
      <div className={styles.grid2}>
        <ChartBlock />
        <ChartBlock />
      </div>
    </>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <div className={styles.statsGrid}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.skStat}>
              <Skeleton variant="block" />
            </div>
          </div>
        ))}
      </div>
      <ChartsSkeleton />
    </>
  );
}
