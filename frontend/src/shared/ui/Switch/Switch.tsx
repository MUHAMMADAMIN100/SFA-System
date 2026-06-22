import { motion } from "framer-motion";

import { spring } from "@/shared/config/motion";

import styles from "./Switch.module.scss";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  tone?: "primary" | "success";
  id?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  tone = "primary",
  id,
}: SwitchProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={styles.row}
      onClick={() => onChange(!checked)}
    >
      {(label || description) && (
        <span className={styles.text}>
          {label && <span className={styles.label}>{label}</span>}
          {description && <span className={styles.desc}>{description}</span>}
        </span>
      )}
      <span
        className={`${styles.track} ${checked ? styles.on : ""} ${
          styles[`tone_${tone}`]
        }`}
      >
        <motion.span className={styles.knob} layout transition={spring} />
      </span>
    </button>
  );
}
