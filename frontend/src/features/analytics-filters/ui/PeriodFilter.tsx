
import { useEffect, useState } from "react";

import { DateRange } from "@/entities/analytics";
import { Button, Input } from "@/shared/ui";

import styles from "./PeriodFilter.module.scss";

type Preset = "day" | "week" | "month" | "custom";

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function presetRange(p: Preset): DateRange {
  const today = fmt(new Date());
  if (p === "day") return { date_from: today, date_to: today };
  if (p === "week") return { date_from: fmt(daysAgo(6)), date_to: today };
  if (p === "month") return { date_from: fmt(daysAgo(29)), date_to: today };
  return {};
}

const LABELS: Record<Exclude<Preset, "custom">, string> = {
  day: "День",
  week: "Неделя",
  month: "Месяц",
};

interface PeriodFilterProps {
  onChange: (range: DateRange) => void;
}

export function PeriodFilter({ onChange }: PeriodFilterProps) {
  const [preset, setPreset] = useState<Preset>("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Применяем «Месяц» по умолчанию при первом рендере.
  useEffect(() => {
    onChange(presetRange("month"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectPreset(p: Exclude<Preset, "custom">) {
    setPreset(p);
    onChange(presetRange(p));
  }

  function applyCustom() {
    setPreset("custom");
    onChange({ date_from: from || undefined, date_to: to || undefined });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.presets}>
        {(Object.keys(LABELS) as Array<Exclude<Preset, "custom">>).map((p) => (
          <Button
            key={p}
            type="button"
            variant={preset === p ? "primary" : "secondary"}
            onClick={() => selectPreset(p)}
          >
            {LABELS[p]}
          </Button>
        ))}
      </div>

      <div className={styles.custom}>
        <Input
          type="date"
          aria-label="Дата с"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <span className={styles.dash}>—</span>
        <Input
          type="date"
          aria-label="Дата по"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <Button
          type="button"
          variant={preset === "custom" ? "primary" : "secondary"}
          onClick={applyCustom}
        >
          Применить
        </Button>
      </div>
    </div>
  );
}
