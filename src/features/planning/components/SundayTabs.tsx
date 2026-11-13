"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { formatShortDate, getScheduleProgress } from "@/lib/meeting";
import type { SundaySchedule } from "@/types/meeting";
import styles from "./Planner.module.css";

type SundayTabsProps = {
  dates: Array<Date | null>;
  schedules: SundaySchedule[];
  selectedSunday: number;
  onSelect: (index: number) => void;
};

function getStatus(schedule: SundaySchedule, sundayNumber: number) {
  const { filled, total } = getScheduleProgress(schedule, sundayNumber);

  if (filled === 0) {
    return { label: "Não iniciado", tone: styles.statusEmpty };
  }

  if (filled === total) {
    return { label: "Completo", tone: styles.statusDone };
  }

  return { label: `${filled} de ${total}`, tone: styles.statusProgress };
}

/** Abas dos cinco domingos do mês (navegáveis pelas setas do teclado). */
export function SundayTabs({ dates, schedules, selectedSunday, onSelect }: SundayTabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Em telas estreitas as abas rolam na horizontal: mantém a selecionada visível.
  useEffect(() => {
    tabRefs.current[selectedSunday]?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [selectedSunday]);

  function focusTab(index: number) {
    const nextIndex = (index + schedules.length) % schedules.length;

    onSelect(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab(index - 1);
    }
  }

  return (
    <div className={styles.tabs} role="tablist" aria-label="Domingos do mês">
      {schedules.map((schedule, index) => {
        const sundayNumber = index + 1;
        const selected = index === selectedSunday;
        const status = getStatus(schedule, sundayNumber);
        const date = dates[index] ?? null;

        return (
          <button
            key={sundayNumber}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`sunday-tab-${index}`}
            aria-selected={selected}
            aria-controls="sunday-panel"
            tabIndex={selected ? 0 : -1}
            className={styles.tab}
            onClick={() => onSelect(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <span className={styles.tabLabel}>Domingo {sundayNumber}</span>
            <strong className={styles.tabDate}>{formatShortDate(date)}</strong>
            <span className={`${styles.tabStatus} ${status.tone}`}>{status.label}</span>
          </button>
        );
      })}
    </div>
  );
}
