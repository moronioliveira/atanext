import { formatShortDate, hasScheduleContent } from "@/lib/meeting-utils";
import type { SundaySchedule } from "@/types/meeting";
import styles from "./meeting.module.css";

type SundayTabsProps = {
  dates: Array<Date | null>;
  schedules: SundaySchedule[];
  selectedSunday: number;
  onSelect: (index: number) => void;
};

export function SundayTabs({
  dates,
  schedules,
  selectedSunday,
  onSelect,
}: SundayTabsProps) {
  return (
    <nav className={styles.sundayTabs} aria-label="Domingos do mês">
      {Array.from({ length: 5 }, (_, index) => (
        <button
          key={index}
          className={
            selectedSunday === index
              ? `${styles.sundayTab} ${styles.sundayTabActive}`
              : styles.sundayTab
          }
          onClick={() => onSelect(index)}
        >
          <span>Domingo {index + 1}</span>
          <strong>{formatShortDate(dates[index] ?? null)}</strong>
          {hasScheduleContent(schedules[index]) && (
            <i aria-label="Preenchido" />
          )}
        </button>
      ))}
    </nav>
  );
}
