import styles from "./Table.module.scss";

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}
