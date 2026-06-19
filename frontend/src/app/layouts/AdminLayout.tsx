import { AdminSidebar } from "@/widgets/admin-sidebar";

import { RouteTransition } from "../RouteTransition";
import styles from "./AdminLayout.module.scss";

export function AdminLayout() {
  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <main className={styles.main}>
        <RouteTransition />
      </main>
    </div>
  );
}
