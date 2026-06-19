import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { useState } from "react";

import { Visit } from "@/entities/visit";
import { fadeUp, stagger } from "@/shared/config/motion";
import { formatDateTime } from "@/shared/lib/format";
import { EmptyState, FadeImg, Modal, Table } from "@/shared/ui";

import styles from "./VisitFeedTable.module.scss";

export function VisitFeedTable({ visits }: { visits: Visit[] }) {
  const [photo, setPhoto] = useState<string | null>(null);

  if (visits.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Визиты не найдены"
        description="За выбранный период визитов нет. Измените период или фильтр менеджера."
      />
    );
  }

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Время</th>
            <th>Менеджер</th>
            <th>Магазин</th>
            <th>Товары</th>
            <th>Фото</th>
          </tr>
        </thead>
        <motion.tbody variants={stagger} initial="initial" animate="animate">
          {visits.map((v) => (
            <motion.tr key={v.id} variants={fadeUp}>
              <td className={styles.nowrap}>{formatDateTime(v.created_at)}</td>
              <td>{v.manager_name}</td>
              <td>{v.store_name}</td>
              <td>
                <ul className={styles.items}>
                  {v.items.map((it) => (
                    <li key={it.id}>
                      {it.product_name}: отгружено {it.shipped_qty} / просрочка{" "}
                      {it.expired_qty}
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                {v.invoice_photo && (
                  <button
                    type="button"
                    className={styles.thumbBtn}
                    onClick={() => setPhoto(v.invoice_photo)}
                  >
                    <FadeImg
                      src={v.invoice_photo}
                      alt="Накладная"
                      className={styles.thumb}
                    />
                  </button>
                )}
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </Table>

      <Modal open={!!photo} onClose={() => setPhoto(null)} title="Накладная">
        {photo && <FadeImg src={photo} alt="Накладная" className={styles.full} />}
      </Modal>
    </>
  );
}
