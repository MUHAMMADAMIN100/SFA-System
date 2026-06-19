import { forwardRef, SelectHTMLAttributes } from "react";

import styles from "./Select.module.scss";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, className, children, ...rest },
  ref
) {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <select ref={ref} className={`${styles.select} ${className ?? ""}`} {...rest}>
        {children}
      </select>
    </label>
  );
});
