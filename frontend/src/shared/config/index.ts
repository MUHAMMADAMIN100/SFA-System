export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const ROUTES = {
  login: "/login",
  managerHome: "/",
  managerHistory: "/history",
  adminHome: "/admin",
  adminFeed: "/admin/feed",
  adminManagers: "/admin/managers",
  adminProducts: "/admin/products",
  catalogStores: "/admin/catalog/stores",
  catalogProducts: "/admin/catalog/products",
  catalogManagers: "/admin/catalog/managers",
} as const;
