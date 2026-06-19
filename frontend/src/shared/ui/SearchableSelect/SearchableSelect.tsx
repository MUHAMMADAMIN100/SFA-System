
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./SearchableSelect.module.scss";

export interface Option {
  value: number;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: number | null;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  label,
  placeholder = "Начните вводить…",
  error,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function pick(opt: Option) {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className={styles.field} ref={wrapperRef}>
      {label && <span className={styles.label}>{label}</span>}
      <button
        type="button"
        className={`${styles.control} ${error ? styles.invalid : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={selected ? styles.value : styles.placeholder}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={styles.caret}>▾</span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <input
            autoFocus
            className={styles.search}
            placeholder="Поиск…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className={styles.list}>
            {filtered.length === 0 && (
              <li className={styles.empty}>Ничего не найдено</li>
            )}
            {filtered.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  className={`${styles.option} ${
                    opt.value === value ? styles.active : ""
                  }`}
                  onClick={() => pick(opt)}
                >
                  <span>{opt.label}</span>
                  {opt.sublabel && (
                    <span className={styles.sublabel}>{opt.sublabel}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
