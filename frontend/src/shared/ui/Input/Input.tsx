import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

import styles from "./Input.module.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Приставка справа внутри поля (напр. валюта «смн»). */
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, suffix, className, id, ...rest },
  ref
) {
  return (
    <label className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      <span className={styles.control}>
        <input
          ref={ref}
          id={id}
          className={`${styles.input} ${error ? styles.invalid : ""} ${
            suffix ? styles.hasSuffix : ""
          } ${className ?? ""}`}
          {...rest}
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </span>
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
});
