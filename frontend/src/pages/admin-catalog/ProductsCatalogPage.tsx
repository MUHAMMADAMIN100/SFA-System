import { CheckCircle2, Package, Pencil, Plus, Power, XCircle } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  createProduct,
  fetchProducts,
  Product,
  updateProduct,
} from "@/entities/product";
import { formatPrice } from "@/shared/lib/format";
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

export function ProductsCatalogPage() {
  const { showToast } = useToast();
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

  return (
    <>
      <PageHeader
        title="Товары"
        subtitle={
          items.length
            ? `${items.length} позиций в каталоге`
            : "Каталог товаров для оформления визитов"
        }
        actions={
          <Button icon={<Plus size={16} aria-hidden />} onClick={openCreate}>
            Добавить товар
          </Button>
        }
      />

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Товаров пока нет"
          description="Добавьте товары, чтобы они появились в форме визита."
          action={
            <Button icon={<Plus size={16} aria-hidden />} onClick={openCreate}>
              Добавить товар
            </Button>
          }
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Название</th>
              <th>Объём/вес</th>
              <th>Цена</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className={p.is_active ? "" : catalog.inactive}>
                <td>
                  <div className={catalog.nameCell}>
                    <span className={`${catalog.tile} ${catalog.tileProduct}`}>
                      <Package size={18} aria-hidden />
                    </span>
                    <span className={catalog.nameTitle}>{p.name}</span>
                  </div>
                </td>
                <td>{p.volume}</td>
                <td>
                  <span className={catalog.price}>
                    {formatPrice(p.price)}
                    <span className={catalog.currency}>сум</span>
                  </span>
                </td>
                <td>
                  <span
                    className={`${catalog.pill} ${
                      p.is_active ? catalog.pillActive : catalog.pillInactive
                    }`}
                  >
                    {p.is_active ? (
                      <CheckCircle2 size={13} aria-hidden />
                    ) : (
                      <XCircle size={13} aria-hidden />
                    )}
                    {p.is_active ? "Активен" : "Неактивен"}
                  </span>
                </td>
                <td>
                  <div className={catalog.actionsCell}>
                    <Button
                      variant="secondary"
                      icon={<Pencil size={15} aria-hidden />}
                      onClick={() => openEdit(p)}
                    >
                      Изменить
                    </Button>
                    <Button
                      variant="ghost"
                      icon={<Power size={15} aria-hidden />}
                      onClick={() => toggleActive(p)}
                    >
                      {p.is_active ? "Деактивировать" : "Активировать"}
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
        title={editing ? "Изменить товар" : "Новый товар"}
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
          <Input
            label="Объём/вес (напр. «1 л», «500 г»)"
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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <label className={catalog.checkboxRow}>
            <input
              type="checkbox"
              className={catalog.checkbox}
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Активен
          </label>
        </form>
      </Modal>
    </>
  );
}
