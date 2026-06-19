import { Link, useLocation } from "react-router-dom";

import { useAuth } from "@/features/auth";
import { Button } from "@/shared/ui";

import { RouteTransition } from "../RouteTransition";
import styles from "./ManagerLayout.module.scss";

export function ManagerLayout() {
  const { pathname } = useLocation();
  const { fullName, logout } = useAuth();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.left}>
          <span className={styles.logo}>SFA</span>
          <nav className={styles.nav}>
            <Link to="/" className={pathname === "/" ? styles.active : ""}>
              Новый визит
            </Link>
            <Link
              to="/history"
              className={pathname === "/history" ? styles.active : ""}
            >
              История
            </Link>
          </nav>
        </div>
        <div className={styles.right}>
          {fullName && <span className={styles.user}>{fullName}</span>}
          <Button variant="ghost" onClick={logout}>
            Выйти
          </Button>
        </div>
      </header>
      <main className={styles.main}>
        <RouteTransition />
      </main>
    </div>
  );
}
