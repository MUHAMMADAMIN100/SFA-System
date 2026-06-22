import { Milk, Pencil, Power, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  createProduct,
  deleteProduct,
  fetchProducts,
  Product,
  updateProduct,
} from "@/entities/product";
import { formatPrice } from "@/shared/lib/format";
import {
  Avatar,
  Button,
  Column,
  DataTable,
  Input,
  Modal,
  RowAction,
  RowStatus,
  Switch,
  useConfirm,
  useToast,
} from "@/shared/ui";
import catalog from "@/shared/styles/catalog.module.scss";

const columns: Column<Product>[] = [
  { key: "name", header: "Название", width: "34%", render: (p) => p.name },
  { key: "volume", header: "Объём/вес", width: "16%", render: (p) => p.volume },
  {
    key: "price",
    header: "Цена",
    width: "28%",
    align: "right",
    render: (p) => (
      <span className={catalog.price}>
        {formatPrice(p.price)}
        <span className={catalog.currency}>смн</span>
      </span>
    ),
  },
];

const getAvatar = (): Avatar => ({ kind: "icon", icon: Milk, tone: "success" });
const getStatus = (p: Product): RowStatus => (p.is_active ? "active" : "inactive");

export function ProductsCatalogPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [volume, setVolume] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    fetchProducts()
      .then(setItems)
      .catch(() => showToast("Не удалось загрузить товары", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setVolume("");
    setPrice("");
    setIsActive(true);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setName(p.name);
    setVolume(p.volume);
    setPrice(p.price);
    setIsActive(p.is_active);
    setOpen(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !volume.trim() || !price) {
      showToast("Заполните название, объём и цену", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = { name, volume, price, is_active: isActive };
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
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

  async function toggleActive(p: Product) {
    try {
      await updateProduct(p.id, { is_active: !p.is_active });
      showToast(p.is_active ? "Товар деактивирован" : "Товар активирован", "success");
      load();
    } catch {
      showToast("Не удалось изменить статус", "error");
    }
  }

  async function remove(p: Product) {
    const ok = await confirm({
      title: "Удалить товар?",
      message: (
        <>
          Товар <b>«{p.name}»</b> будет удалён без возможности восстановления.
        </>
      ),
      confirmLabel: "Удалить",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteProduct(p.id);
      showToast("Товар удалён", "success");
      load();
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      showToast(detail ?? "Не удалось удалить товар", "error");
    }
  }

  const getActions = (p: Product): RowAction<Product>[] => [
    { icon: Pencil, label: "Изменить", onClick: () => openEdit(p) },
    {
      icon: Power,
      label: p.is_active ? "Деактивировать" : "Активировать",
      onClick: () => toggleActive(p),
    },
    { icon: Trash2, label: "Удалить", onClick: () => remove(p), variant: "danger" },
  ];

  return (
    <>
      <DataTable<Product>
        title="Товары"
        addLabel="Добавить товар"
        onAdd={openCreate}
        columns={columns}
        rows={items}
        rowKey={(p) => p.id}
        getAvatar={getAvatar}
        getStatus={getStatus}
        getActions={getActions}
        loading={loading}
        emptyIcon={Milk}
        emptyText="Товаров пока нет — добавьте первый"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        icon={Milk}
        iconTone="success"
        title={editing ? "Изменить товар" : "Новый товар"}
        subtitle={
          editing ? "Обновите данные позиции" : "Новая позиция в каталоге товаров"
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button form="product-form" type="submit" loading={saving}>
              Сохранить
            </Button>
          </>
        }
      >
        <form id="product-form" className={catalog.form} onSubmit={save}>
          <Input
            label="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className={catalog.formRow}>
            <Input
              label="Объём/вес"
              placeholder="напр. 1 л, 500 г"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              required
            />
            <Input
              label="Цена"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              suffix="смн"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <Switch
            checked={isActive}
            onChange={setIsActive}
            tone="success"
            label="Активен"
            description="Доступен для оформления визитов"
          />
        </form>
      </Modal>
    </>
  );
}
