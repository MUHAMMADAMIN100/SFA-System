import {
  CheckCircle2,
  Pencil,
  Plus,
  Power,
  UserCog,
  XCircle,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  createManager,
  fetchManagers,
  Manager,
  updateManager,
} from "@/entities/user";
import { avatarIndex, initials } from "@/shared/lib/avatar";
import {
  Button,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Table,
  TableSkeleton,
  useToast,
} from "@/shared/ui";
import catalog from "@/shared/styles/catalog.module.scss";

export function ManagersCatalogPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Manager | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    fetchManagers()
      .then(setItems)
      .catch(() => showToast("Не удалось загрузить менеджеров", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setFullName("");
    setUsername("");
    setPassword("");
    setOpen(true);
  }

  function openEdit(m: Manager) {
    setEditing(m);
    setFullName(m.full_name);
    setUsername(m.username);
    setPassword("");
    setOpen(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) {
      showToast("Укажите ФИО и логин", "error");
      return;
    }
    if (!editing && !password) {
      showToast("Задайте пароль", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateManager(editing.id, {
          full_name: fullName,
          ...(password ? { password } : {}),
        });
      } else {
        await createManager({ username, full_name: fullName, password });
      }
      showToast("Сохранено", "success");
      setOpen(false);
      load();
    } catch {
      showToast("Не удалось сохранить (возможно, логин занят)", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(m: Manager) {
    try {
      await updateManager(m.id, { is_active: !m.is_active });
      showToast(
        m.is_active ? "Менеджер деактивирован" : "Менеджер активирован",
        "success"
      );
      load();
    } catch {
      showToast("Не удалось изменить статус", "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Менеджеры"
        subtitle={
          items.length
            ? `${items.length} учётных записей менеджеров`
            : "Полевые сотрудники, оформляющие визиты"
        }
        actions={
          <Button icon={<Plus size={16} aria-hidden />} onClick={openCreate}>
            Добавить менеджера
          </Button>
        }
      />

      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Менеджеров пока нет"
          description="Создайте учётные записи менеджеров: ФИО, логин и пароль."
          action={
            <Button icon={<Plus size={16} aria-hidden />} onClick={openCreate}>
              Добавить менеджера
            </Button>
          }
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Логин</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} className={m.is_active ? "" : catalog.inactive}>
                <td>
                  <div className={catalog.nameCell}>
                    <span
                      className={`${catalog.avatar} ${
                        catalog[`av${avatarIndex(m.username)}`]
                      } ${m.is_active ? "" : catalog.avatarMuted}`}
                    >
                      {initials(m.full_name || m.username)}
                    </span>
                    <span className={catalog.nameTitle}>{m.full_name || "—"}</span>
                  </div>
                </td>
                <td>{m.username}</td>
                <td>
                  <span
                    className={`${catalog.pill} ${
                      m.is_active ? catalog.pillActive : catalog.pillInactive
                    }`}
                  >
                    {m.is_active ? (
                      <CheckCircle2 size={13} aria-hidden />
                    ) : (
                      <XCircle size={13} aria-hidden />
                    )}
                    {m.is_active ? "Активен" : "Неактивен"}
                  </span>
                </td>
                <td>
                  <div className={catalog.actionsCell}>
                    <Button
                      variant="secondary"
                      icon={<Pencil size={15} aria-hidden />}
                      onClick={() => openEdit(m)}
                    >
                      Изменить
                    </Button>
                    <Button
                      variant="ghost"
                      icon={<Power size={15} aria-hidden />}
                      onClick={() => toggleActive(m)}
                    >
                      {m.is_active ? "Деактивировать" : "Активировать"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Изменить менеджера" : "Новый менеджер"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button form="manager-form" type="submit" loading={saving}>
              Сохранить
            </Button>
          </>
        }
      >
        <form id="manager-form" className={catalog.form} onSubmit={save}>
          <Input
            label="ФИО"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!!editing}
            required
          />
          <Input
            label={editing ? "Новый пароль (если меняете)" : "Пароль"}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </form>
      </Modal>
    </>
  );
}
