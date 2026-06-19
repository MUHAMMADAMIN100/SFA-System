import { forwardRef, InputHTMLAttributes } from "react";

import styles from "./Input.module.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...rest },
  ref
) {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <input
        ref={ref}
        id={id}
        className={`${styles.input} ${error ? styles.invalid : ""} ${className ?? ""}`}
        {...rest}
      />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
});
