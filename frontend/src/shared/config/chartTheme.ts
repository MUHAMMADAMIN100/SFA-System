// Единая палитра графиков: один акцент (отгрузка) + тёплый красно-янтарный
// (просрочка) + нейтральная шкала. Без радуги и фиолетовых градиентов.
export const chartTheme = {
  shipped: "#1c6db0",
  shippedSoft: "#bcd7ec",
  expired: "#cf5c2e",
  expiredSoft: "#f0c9b6",
  grid: "#e7e8e2",
  axis: "#9a9d95",
  threshold: "#cf5c2e",
  // Категориальная палитра для donut: приглушённая, гармоничная.
  categorical: [
    "#1c6db0",
    "#4a93c6",
    "#52a8a0",
    "#7da45c",
    "#d9a441",
    "#cf5c2e",
  ],
  rest: "#b6b8b0",
} as const;

// Стиль тултипов recharts (передаётся как prop в библиотеку графиков).
export const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e2e3dd",
  borderRadius: 8,
  fontSize: 13,
  boxShadow: "0 4px 16px rgba(20, 22, 18, 0.1)",
  padding: "8px 12px",
};

export const tooltipLabelStyle = { color: "#6c6f68", marginBottom: 4 };

