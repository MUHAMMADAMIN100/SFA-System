import { Pencil, Store as StoreIcon, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  createStore,
  deleteStore,
  fetchStores,
  Store,
  updateStore,
} from "@/entities/store";
import {
  Avatar,
  Button,
  Column,
  DataTable,
  Input,
  Modal,
  RowAction,
  useToast,
} from "@/shared/ui";
import catalog from "@/shared/styles/catalog.module.scss";

const columns: Column<Store>[] = [
  { key: "name", header: "Название", width: "44%", render: (s) => s.name },
  { key: "address", header: "Адрес", width: "34%", render: (s) => s.address || "—" },
];

const getAvatar = (): Avatar => ({ kind: "icon", icon: StoreIcon, tone: "info" });

export function StoresCatalogPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    fetchStores()
      .then(setItems)
      .catch(() => showToast("Не удалось загрузить магазины", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setAddress("");
    setOpen(true);
  }

  function openEdit(store: Store) {
    setEditing(store);
    setName(store.name);
    setAddress(store.address);
    setOpen(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Укажите название", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateStore(editing.id, { name, address });
      } else {
        await createStore({ name, address });
      }
      showToast("Сохранено", "success");
      setOpen(false);
      load();
    } catch {
      showToast("Не удалось сохранить", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(store: Store) {
    if (!window.confirm(`Удалить «${store.name}»?`)) return;
    try {
      await deleteStore(store.id);
      showToast("Удалено", "success");
      load();
    } catch {
      showToast("Невозможно удалить: есть связанные визиты", "error");
    }
  }

  const getActions = (s: Store): RowAction<Store>[] => [
    { icon: Pencil, label: "Изменить", onClick: () => openEdit(s) },
    { icon: Trash2, label: "Удалить", onClick: () => remove(s), variant: "danger" },
  ];

  return (
    <>
      <DataTable<Store>
        title="Магазины"
        addLabel="Добавить магазин"
        onAdd={openCreate}
        columns={columns}
        rows={items}
        rowKey={(s) => s.id}
        getAvatar={getAvatar}
        getActions={getActions}
        loading={loading}
        emptyIcon={StoreIcon}
        emptyText="Магазинов пока нет — добавьте первый"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Изменить магазин" : "Новый магазин"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button form="store-form" type="submit" loading={saving}>
              Сохранить
            </Button>
          </>
        }
      >
        <form id="store-form" className={catalog.form} onSubmit={save}>
          <Input
            label="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Адрес"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </form>
      </Modal>
    </>
  );
}
