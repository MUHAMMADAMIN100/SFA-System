import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";

import { dur, ease } from "@/shared/config/motion";

interface CountUpProps {
  value: number;
  format: (n: number) => string;
}

// Плавный счётчик через MotionValue. При prefers-reduced-motion — сразу финал.
export function CountUp({ value, format }: CountUpProps) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (latest) => format(latest));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: dur.slow, ease });
    return () => controls.stop();
  }, [value, reduce, mv]);

  return <motion.span>{text}</motion.span>;
}
