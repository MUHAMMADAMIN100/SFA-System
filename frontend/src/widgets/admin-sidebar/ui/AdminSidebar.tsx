import { motion } from "framer-motion";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  LucideIcon,
  Package,
  Store,
  UserCog,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "@/features/auth";
import { ROUTES } from "@/shared/config";
import { spring } from "@/shared/config/motion";
import { Button } from "@/shared/ui";

import styles from "./AdminSidebar.module.scss";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const MAIN: NavItem[] = [
  { to: ROUTES.adminHome, label: "Дашборд", icon: LayoutDashboard },
  { to: ROUTES.adminFeed, label: "Лента визитов", icon: ClipboardList },
  { to: ROUTES.adminManagers, label: "KPI менеджеров", icon: Users },
  { to: ROUTES.adminProducts, label: "Аналитика по товарам", icon: BarChart3 },
];

const CATALOG: NavItem[] = [
  { to: ROUTES.catalogStores, label: "Магазины", icon: Store },
  { to: ROUTES.catalogProducts, label: "Товары", icon: Package },
  { to: ROUTES.catalogManagers, label: "Менеджеры", icon: UserCog },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
  const { fullName, logout } = useAuth();

  function renderLink(item: NavItem) {
    const active = pathname === item.to;
    const Icon = item.icon;
    return (
      <Link
        key={item.to}
        to={item.to}
        className={`${styles.link} ${active ? styles.active : ""}`}
      >
        {active && (
          <motion.span
            layoutId="sidebar-active"
            className={styles.activeBg}
            transition={spring}
          />
        )}
        <Icon size={18} strokeWidth={1.75} className={styles.linkIcon} aria-hidden />
        <span className={styles.linkLabel}>{item.label}</span>
      </Link>
    );
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.logo}>SFA</span>
        <span className={styles.brandSub}>Панель администратора</span>
      </div>

      <nav className={styles.nav}>
        {MAIN.map(renderLink)}
        <div className={styles.groupLabel}>Справочники</div>
        {CATALOG.map(renderLink)}
      </nav>

      <div className={styles.footer}>
        {fullName && <span className={styles.user}>{fullName}</span>}
        <Button
          variant="secondary"
          fullWidth
          icon={<LogOut size={16} aria-hidden />}
          onClick={logout}
        >
          Выйти
        </Button>
      </div>
    </aside>
  );
}
