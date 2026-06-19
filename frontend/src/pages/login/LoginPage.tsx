import { Navigate } from "react-router-dom";

import { LoginForm } from "@/features/auth";
import { getRole, homeForRole } from "@/shared/lib/session";

import styles from "./login.module.scss";

export function LoginPage() {
  const role = getRole();
  if (role) return <Navigate to={homeForRole(role)} replace />;

  return (
    <main className={styles.main}>
      <LoginForm />
    </main>
  );
}
