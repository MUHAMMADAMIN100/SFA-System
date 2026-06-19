import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import styles from "./EmptyState.module.scss";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.wrap}>
      <span className={styles.iconWrap}>
        <Icon size={26} strokeWidth={1.75} aria-hidden />
      </span>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.desc}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
