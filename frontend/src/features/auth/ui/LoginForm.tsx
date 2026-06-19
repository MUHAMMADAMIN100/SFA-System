import { LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { homeForRole, saveSession } from "@/shared/lib/session";
import { Button, Input } from "@/shared/ui";

import { login } from "../api/authApi";
import styles from "./LoginForm.module.scss";

export function LoginForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(username.trim(), password);
      saveSession({
        access: data.access,
        refresh: data.refresh,
        role: data.role,
        fullName: data.full_name,
      });
      navigate(homeForRole(data.role), { replace: true });
    } catch {
      setError("Неверный логин или пароль");
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.head}>
        <h1 className={styles.title}>SFA — вход</h1>
        <p className={styles.subtitle}>Учёт визитов торговых представителей</p>
      </div>

      <Input
        label="Логин"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        required
      />
      <Input
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />

      {error && <p className={styles.error}>{error}</p>}

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={loading}
        icon={<LogIn size={18} aria-hidden />}
      >
        Войти
      </Button>
    </form>
  );
}
