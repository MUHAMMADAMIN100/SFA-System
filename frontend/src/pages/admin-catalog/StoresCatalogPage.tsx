import { Pencil, Plus, Store as StoreIcon, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  createStore,
  deleteStore,
  fetchStores,
  Store,
  updateStore,
} from "@/entities/store";
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

  return (
    <>
      <PageHeader
        title="Магазины"
        actions={
          <Button icon={<Plus size={16} aria-hidden />} onClick={openCreate}>
            Добавить магазин
          </Button>
        }
      />

      {loading ? (
        <TableSkeleton rows={5} cols={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={StoreIcon}
          title="Магазинов пока нет"
          description="Добавьте первый магазин, чтобы менеджеры могли оформлять визиты."
          action={
            <Button icon={<Plus size={16} aria-hidden />} onClick={openCreate}>
              Добавить магазин
            </Button>
          }
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Название</th>
              <th>Адрес</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.address || "—"}</td>
                <td>
                  <div className={catalog.actionsCell}>
                    <Button
                      variant="secondary"
                      icon={<Pencil size={15} aria-hidden />}
                      onClick={() => openEdit(s)}
                    >
                      Изменить
                    </Button>
                    <Button
                      variant="danger"
                      icon={<Trash2 size={15} aria-hidden />}
                      onClick={() => remove(s)}
                    >
                      Удалить
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
