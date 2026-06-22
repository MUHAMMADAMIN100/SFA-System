import { Pencil, Power, Users } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  createManager,
  fetchManagers,
  Manager,
  updateManager,
} from "@/entities/user";
import { initials } from "@/shared/lib/avatar";
import {
  Avatar,
  Button,
  Column,
  DataTable,
  Input,
  Modal,
  RowAction,
  RowStatus,
  useToast,
} from "@/shared/ui";
import catalog from "@/shared/styles/catalog.module.scss";

const columns: Column<Manager>[] = [
  { key: "name", header: "ФИО", width: "46%", render: (m) => m.full_name || "—" },
  { key: "username", header: "Логин", width: "32%", render: (m) => m.username },
];

const getAvatar = (m: Manager): Avatar => ({
  kind: "initials",
  initials: initials(m.full_name || m.username),
  tone: m.is_active ? "info" : "muted",
});

const getStatus = (m: Manager): RowStatus => (m.is_active ? "active" : "inactive");

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

  const getActions = (m: Manager): RowAction<Manager>[] => [
    { icon: Pencil, label: "Изменить", onClick: () => openEdit(m) },
    {
      icon: Power,
      label: m.is_active ? "Деактивировать" : "Активировать",
      onClick: () => toggleActive(m),
    },
  ];

  return (
    <>
      <DataTable<Manager>
        title="Менеджеры"
        addLabel="Добавить менеджера"
        onAdd={openCreate}
        columns={columns}
        rows={items}
        rowKey={(m) => m.id}
        getAvatar={getAvatar}
        getStatus={getStatus}
        getActions={getActions}
        loading={loading}
        emptyIcon={Users}
        emptyText="Менеджеров пока нет — создайте первого"
      />

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
