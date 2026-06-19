import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Перед каждым прогоном сбрасываем e2e-данные (детерминированная аналитика).
export default function globalSetup() {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const backend = path.resolve(dir, "..", "..", "backend");
  const python = path.join(backend, ".venv", "Scripts", "python.exe");
  execFileSync(python, ["manage.py", "seed_e2e"], {
    cwd: backend,
    stdio: "inherit",
  });
}
