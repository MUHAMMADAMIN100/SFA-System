import { AnimatePresence, motion } from "framer-motion";
import { Plus, Send, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { fetchProducts, Product } from "@/entities/product";
import { fetchStores, Store } from "@/entities/store";
import { createVisit, VisitItemInput } from "@/entities/visit";
import { PhotoCapture } from "@/features/visit-photo";
import { dur, ease } from "@/shared/config/motion";
import {
  Button,
  Input,
  Option,
  SearchableSelect,
  Select,
  Skeleton,
  useToast,
} from "@/shared/ui";

import styles from "./VisitForm.module.scss";

interface Row {
  id: number;
  product: number | null;
  shipped: string;
  expired: string;
}

interface FormErrors {
  store?: string;
  items?: string;
  photo?: string;
}

function emptyRow(id: number): Row {
  return { id, product: null, shipped: "0", expired: "0" };
}

export function VisitForm() {
  const { showToast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [storeId, setStoreId] = useState<number | null>(null);
  const rowKey = useRef(1);
  const [rows, setRows] = useState<Row[]>([emptyRow(0)]);
  const [photo, setPhoto] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    Promise.all([fetchStores(), fetchProducts(true)])
      .then(([s, p]) => {
        setStores(s);
        setProducts(p);
      })
      .catch(() => showToast("Не удалось загрузить справочники", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const storeOptions: Option[] = useMemo(
    () =>
      stores.map((s) => ({
        value: s.id,
        label: s.name,
        sublabel: s.address || undefined,
      })),
    [stores]
  );

  function addRow() {
    setRows((r) => [...r, emptyRow(rowKey.current++)]);
  }

  function removeRow(id: number) {
    setRows((r) => (r.length === 1 ? r : r.filter((row) => row.id !== id)));
  }

  function updateRow(id: number, patch: Partial<Row>) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function resetForm() {
    setStoreId(null);
    rowKey.current = 1;
    setRows([emptyRow(0)]);
    setPhoto(null);
    setErrors({});
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const items: VisitItemInput[] = rows
      .filter((r) => r.product !== null)
      .map((r) => ({
        product: r.product as number,
        shipped_qty: Number(r.shipped) || 0,
        expired_qty: Number(r.expired) || 0,
      }));

    // Строка с количеством, но без выбранного товара — это ошибка, а не «молча выкинуть».
    const hasGhostRow = rows.some(
      (r) => r.product === null && (Number(r.shipped) > 0 || Number(r.expired) > 0)
    );

    const next: FormErrors = {};
    if (!storeId) next.store = "Выберите магазин";
    if (items.length === 0) next.items = "Добавьте хотя бы один товар";
    else if (hasGhostRow) next.items = "Выберите товар для заполненной строки";
    if (!photo) next.photo = "Прикрепите фото накладной";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await createVisit({ store: storeId as number, items, photo: photo as File });
      showToast("Визит отправлен", "success");
      resetForm();
    } catch {
      showToast("Не удалось отправить визит", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.form}>
        <div className={styles.section}>
          <div className={styles.skLabel}>
            <Skeleton variant="block" />
          </div>
          <div className={styles.skField}>
            <Skeleton variant="block" />
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.skField}>
            <Skeleton variant="block" />
          </div>
          <div className={styles.skField}>
            <Skeleton variant="block" />
          </div>
        </div>
        <div className={styles.skSubmit}>
          <Skeleton variant="block" />
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <section className={styles.section}>
        <SearchableSelect
          label="Магазин"
          options={storeOptions}
          value={storeId}
          onChange={(v) => {
            setStoreId(v);
            setErrors((e) => ({ ...e, store: undefined }));
          }}
          placeholder="Выберите магазин"
          error={errors.store}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Товары</h2>
        </div>

        <div className={styles.rows}>
          <AnimatePresence initial={false}>
            {rows.map((row) => (
              <motion.div
                key={row.id}
                layout
                className={styles.rowMotion}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: dur.base, ease }}
              >
                <div className={styles.row}>
                  <Select
                    value={row.product ?? ""}
                    onChange={(e) =>
                      updateRow(row.id, {
                        product: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  >
                    <option value="">Выберите товар</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.volume})
                      </option>
                    ))}
                  </Select>

                  <div className={styles.qtyGrid}>
                    <Input
                      label="Отгружено"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={row.shipped}
                      onChange={(e) => updateRow(row.id, { shipped: e.target.value })}
                    />
                    <Input
                      label="Просрочка"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={row.expired}
                      onChange={(e) => updateRow(row.id, { expired: e.target.value })}
                    />
                  </div>

                  {rows.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      className={styles.removeBtn}
                      icon={<Trash2 size={15} aria-hidden />}
                      onClick={() => removeRow(row.id)}
                    >
                      Удалить строку
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Button
          type="button"
          variant="secondary"
          icon={<Plus size={16} aria-hidden />}
          onClick={addRow}
        >
          Добавить товар
        </Button>
        {errors.items && <p className={styles.error}>{errors.items}</p>}
      </section>

      <section className={styles.section}>
        <PhotoCapture
          onChange={(f) => {
            setPhoto(f);
            setErrors((e) => ({ ...e, photo: undefined }));
          }}
          error={errors.photo}
        />
      </section>

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={submitting}
        icon={<Send size={18} aria-hidden />}
      >
        Отправить
      </Button>
    </form>
  );
}
