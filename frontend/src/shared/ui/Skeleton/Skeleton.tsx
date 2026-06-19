import styles from "./Skeleton.module.scss";

type Variant = "text" | "title" | "block" | "circle";

interface SkeletonProps {
  variant?: Variant;
  className?: string;
}

// Базовый шиммер-плейсхолдер. Размеры задаются вариантом или классом потребителя.
export function Skeleton({ variant = "text", className }: SkeletonProps) {
  return (
    <span
      className={`${styles.skeleton} ${styles[variant]} ${className ?? ""}`}
      aria-hidden
    />
  );
}
