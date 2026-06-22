import { motion, useReducedMotion } from "framer-motion";
import { Inbox, LucideIcon, Plus } from "lucide-react";
import { ReactNode } from "react";

import { fade, fadeUp, stagger } from "@/shared/config/motion";

import { Skeleton } from "../Skeleton/Skeleton";
import styles from "./DataTable.module.scss";

export type RowStatus = "active" | "inactive" | "none";
export type AvatarTone = "info" | "success" | "muted";

export interface Column<T> {
  key: string;
  header: string;
  /** Фиксированная ширина для table-layout: fixed, напр. '46%'. */
  width: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
}

export interface RowAction<T> {
  icon: LucideIcon;
  /** Идёт в title и aria-label кнопки. */
  label: string;
  onClick: (row: T) => void;
  variant?: "default" | "danger";
}

export interface Avatar {
  kind: "initials" | "icon";
  initials?: string;
  icon?: LucideIcon;
  tone: AvatarTone;
}

export interface DataTableProps<T> {
  title: string;
  addLabel: string;
  onAdd: () => void;
  /** Первый столбец = имя; аватар добавляется автоматически перед его content. */
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  getAvatar: (row: T) => Avatar;
  getStatus?: (row: T) => RowStatus;
  getActions: (row: T) => RowAction<T>[];
  loading?: boolean;
  emptyText?: string;
  /** Иконка пустого состояния (по умолчанию Inbox). */
  emptyIcon?: LucideIcon;
  /** Ширина колонки действий — одинаковая во всех таблицах для выравнивания. */
  actionsWidth?: string;
}

const SKELETON_ROWS = 6;

function AvatarView({ avatar }: { avatar: Avatar }) {
  const Icon = avatar.icon;
  return (
    <span className={`${styles.avatar} ${styles[`tone_${avatar.tone}`]}`} aria-hidden>
      {avatar.kind === "icon" && Icon ? <Icon size={16} /> : avatar.initials}
    </span>
  );
}

export function DataTable<T>({
  title,
  addLabel,
  onAdd,
  columns,
  rows,
  rowKey,
  getAvatar,
  getStatus,
  getActions,
  loading = false,
  emptyText = "Пока нет записей",
  emptyIcon: EmptyIcon = Inbox,
  actionsWidth = "22%",
}: DataTableProps<T>) {
  const reduce = useReducedMotion();
  const statusOf = (row: T): RowStatus => getStatus?.(row) ?? "none";
  const colCount = columns.length + 1;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <button type="button" className={styles.addBtn} onClick={onAdd}>
          <Plus size={16} aria-hidden />
          {addLabel}
        </button>
      </header>

      <div className={styles.wrapper}>
        <table className={styles.table}>
          <colgroup>
            {columns.map((c) => (
              <col key={c.key} style={{ width: c.width }} />
            ))}
            <col style={{ width: actionsWidth }} />
          </colgroup>

          <thead>
            <tr>
              {columns.map((c, i) => (
                <th
                  key={c.key}
                  className={`${i === 0 ? styles.firstHead : ""} ${
                    c.align === "right" ? styles.right : ""
                  }`}
                >
                  {c.header}
                </th>
              ))}
              <th aria-hidden />
            </tr>
          </thead>

          {loading ? (
            <tbody>
              {Array.from({ length: SKELETON_ROWS }).map((_, r) => (
                <tr key={r} className={styles.row}>
                  {columns.map((c, i) => (
                    <td
                      key={c.key}
                      className={`${
                        i === 0 ? `${styles.cellFirst} ${styles.stripe_none}` : ""
                      } ${c.align === "right" ? styles.right : ""}`}
                    >
                      {i === 0 ? (
                        <div className={styles.nameCell}>
                          <Skeleton variant="circle" className={styles.skAvatar} />
                          <Skeleton variant="text" className={styles.skText} />
                        </div>
                      ) : (
                        <Skeleton variant="text" className={styles.skText} />
                      )}
                    </td>
                  ))}
                  <td className={styles.right}>
                    <div className={styles.actions}>
                      <Skeleton variant="circle" className={styles.skAction} />
                      <Skeleton variant="circle" className={styles.skAction} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={colCount} className={styles.emptyCell}>
                  <div className={styles.empty}>
                    <span className={styles.emptyIcon}>
                      <EmptyIcon size={26} strokeWidth={1.75} aria-hidden />
                    </span>
                    <p className={styles.emptyText}>{emptyText}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <motion.tbody
              variants={reduce ? undefined : stagger}
              initial="initial"
              animate="animate"
            >
              {rows.map((row) => {
                const status = statusOf(row);
                const avatar = getAvatar(row);
                const actions = getActions(row);
                return (
                  <motion.tr
                    key={rowKey(row)}
                    variants={reduce ? fade : fadeUp}
                    className={`${styles.row} ${
                      status === "inactive" ? styles.rowInactive : ""
                    }`}
                  >
                    {columns.map((c, i) =>
                      i === 0 ? (
                        <td
                          key={c.key}
                          className={`${styles.cellFirst} ${styles[`stripe_${status}`]}`}
                        >
                          <div className={styles.nameCell}>
                            <AvatarView avatar={avatar} />
                            <span className={styles.nameText}>{c.render(row)}</span>
                          </div>
                        </td>
                      ) : (
                        <td
                          key={c.key}
                          className={c.align === "right" ? styles.right : ""}
                        >
                          {c.render(row)}
                        </td>
                      )
                    )}
                    <td className={styles.right}>
                      <div className={styles.actions}>
                        {actions.map((a) => {
                          const Icon = a.icon;
                          return (
                            <button
                              key={a.label}
                              type="button"
                              title={a.label}
                              aria-label={a.label}
                              onClick={() => a.onClick(row)}
                              className={`${styles.actionBtn} ${
                                a.variant === "danger" ? styles.actionDanger : ""
                              }`}
                            >
                              <Icon size={16} aria-hidden />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          )}
        </table>
      </div>
    </section>
  );
}
