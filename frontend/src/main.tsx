import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";

import { MotionConfig } from "framer-motion";
import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router";
import { ToastProvider } from "@/shared/ui";

import "@/app/globals.scss";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* reducedMotion="user" — для prefers-reduced-motion framer-motion сводит
        transform-анимации к простому fade автоматически. */}
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </MotionConfig>
  </React.StrictMode>
);
