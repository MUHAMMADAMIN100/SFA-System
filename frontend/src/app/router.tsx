import { createBrowserRouter, Navigate } from "react-router-dom";

import { RequireRole } from "@/features/auth";
import {
  ManagersCatalogPage,
  ProductsCatalogPage,
  StoresCatalogPage,
} from "@/pages/admin-catalog";
import { AdminDashboardPage } from "@/pages/admin-dashboard";
import { AdminFeedPage } from "@/pages/admin-feed";
import { AdminManagersPage } from "@/pages/admin-managers";
import { AdminProductsPage } from "@/pages/admin-products";
import { LoginPage } from "@/pages/login";
import { ManagerHistoryPage } from "@/pages/manager-history";
import { ManagerVisitPage } from "@/pages/manager-visit";

import { AdminLayout } from "./layouts/AdminLayout";
import { ManagerLayout } from "./layouts/ManagerLayout";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: (
      <RequireRole role="manager">
        <ManagerLayout />
      </RequireRole>
    ),
    children: [
      { path: "/", element: <ManagerVisitPage /> },
      { path: "/history", element: <ManagerHistoryPage /> },
    ],
  },
  {
    element: (
      <RequireRole role="admin">
        <AdminLayout />
      </RequireRole>
    ),
    children: [
      { path: "/admin", element: <AdminDashboardPage /> },
      { path: "/admin/feed", element: <AdminFeedPage /> },
      { path: "/admin/managers", element: <AdminManagersPage /> },
      { path: "/admin/products", element: <AdminProductsPage /> },
      { path: "/admin/catalog/stores", element: <StoresCatalogPage /> },
      { path: "/admin/catalog/products", element: <ProductsCatalogPage /> },
      { path: "/admin/catalog/managers", element: <ManagersCatalogPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
