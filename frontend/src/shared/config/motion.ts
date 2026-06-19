import type { Transition, Variants } from "framer-motion";

// Единый язык движения: одни и те же изинги и длительности по всему приложению.
export const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]; // expo-out
export const dur = { fast: 0.15, base: 0.25, slow: 0.4 } as const;
export const spring: Transition = { type: "spring", stiffness: 400, damping: 32 };

export const transition: Transition = { duration: dur.base, ease };

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition },
  exit: { opacity: 0, y: -8, transition: { duration: dur.fast, ease } },
};

export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition },
  exit: { opacity: 0, transition: { duration: dur.fast, ease } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition },
  exit: { opacity: 0, scale: 0.97, transition: { duration: dur.fast, ease } },
};

// Контейнер со стэггером дочерних элементов (каждый — fadeUp).
export const stagger: Variants = {
  animate: { transition: { staggerChildren: 0.05 } },
};
