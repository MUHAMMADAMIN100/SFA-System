import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchMyVisits, Visit } from "@/entities/visit";
import { fadeUp, stagger } from "@/shared/config/motion";
import { formatDateTime } from "@/shared/lib/format";
import { Button, EmptyState, FadeImg, PageHeader, Skeleton, useToast } from "@/shared/ui";

import styles from "./history.module.scss";

export function ManagerHistoryPage() {
  const { showToast } = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchMyVisits(page)
      .then((data) => {
        if (!active) return;
        setVisits((prev) =>
          page === 1 ? data.results : [...prev, ...data.results]
        );
        setHasNext(Boolean(data.next));
      })
      .catch(() => active && showToast("Не удалось загрузить историю", "error"))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, showToast]);

  return (
    <>
      <PageHeader title="История визитов" />

      {loading && page === 1 ? (
        <div className={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skCard}>
              <Skeleton variant="block" />
            </div>
          ))}
        </div>
      ) : visits.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Вы ещё не отправляли визиты"
          description="Оформите первый визит на главном экране — он появится здесь."
        />
      ) : (
        <motion.div
          className={styles.list}
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {visits.map((v) => (
            <motion.article key={v.id} variants={fadeUp} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.store}>{v.store_name}</span>
                <span className={styles.date}>{formatDateTime(v.created_at)}</span>
              </div>
              <ul className={styles.items}>
                {v.items.map((it) => (
                  <li key={it.id}>
                    {it.product_name}: отгружено {it.shipped_qty} / просрочка{" "}
                    {it.expired_qty}
                  </li>
                ))}
              </ul>
              {v.invoice_photo && (
                <a href={v.invoice_photo} target="_blank" rel="noreferrer">
                  <FadeImg
                    src={v.invoice_photo}
                    alt="Накладная"
                    className={styles.thumb}
                  />
                </a>
              )}
            </motion.article>
          ))}
        </motion.div>
      )}

      {hasNext && !loading && (
        <div className={styles.more}>
          <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>
            Показать ещё
          </Button>
        </div>
      )}
    </>
  );
}
