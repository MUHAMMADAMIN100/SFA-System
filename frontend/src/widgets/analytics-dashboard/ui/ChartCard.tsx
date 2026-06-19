import styles from "./dashboard.module.scss";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <section className={styles.card}>
      <header className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {subtitle && <span className={styles.cardSub}>{subtitle}</span>}
      </header>
      {children}
    </section>
  );
}
