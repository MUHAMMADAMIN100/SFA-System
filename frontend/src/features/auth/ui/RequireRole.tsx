import { Navigate } from "react-router-dom";

import { getRole, homeForRole, Role } from "@/shared/lib/session";

interface RequireRoleProps {
  role: Role;
  children: React.ReactNode;
}

// Защита роутов по роли (замена middleware из Next). Роль читается из cookie.
export function RequireRole({ role, children }: RequireRoleProps) {
  const current = getRole();
  if (!current) return <Navigate to="/login" replace />;
  if (current !== role) return <Navigate to={homeForRole(current)} replace />;
  return <>{children}</>;
}
