import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clearSession, getFullName, getRole, Role } from "@/shared/lib/session";

export function useAuth() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    setRole(getRole());
    setFullName(getFullName() ?? "");
  }, []);

  function logout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return { role, fullName, logout };
}
