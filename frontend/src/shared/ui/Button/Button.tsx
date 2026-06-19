import { HTMLMotionProps, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

import styles from "./Button.module.scss";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  icon,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const inert = disabled || loading;
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.button
      className={classes}
      disabled={inert}
      whileHover={inert ? undefined : { y: -1 }}
      whileTap={inert ? undefined : { scale: 0.97 }}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} className={styles.spin} aria-hidden />
      ) : (
        icon
      )}
      {children}
    </motion.button>
  );
}
