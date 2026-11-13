import type { Ref } from "react";
import { formatLongDate, getMeetingTitle, getPrintableSections } from "@/lib/meeting";
import type { SundaySchedule } from "@/types/meeting";
import styles from "./Minutes.module.css";

const SACRAMENT_NOTE = "Após o hino o sacramento será abençoado e distribuído a todos.";

type MinutesDocumentProps = {
  ref?: Ref<HTMLElement>;
  schedule: SundaySchedule;
  sundayNumber: number;
  date: Date | null;
  wardName: string;
};

/**
 * Folha A4 da ata. Mostra somente os campos preenchidos; o tamanho da
 * fonte é ajustado por `usePrintFit` para ocupar a folha inteira.
 */
export function MinutesDocument({
  ref,
  schedule,
  sundayNumber,
  date,
  wardName,
}: MinutesDocumentProps) {
  const sections = getPrintableSections(schedule, sundayNumber);

  return (
    <article className={styles.page} ref={ref} aria-label="Ata da reunião">
      <header className={styles.header}>
        <p>{getMeetingTitle(sundayNumber).toUpperCase()}</p>
        <h1>{wardName}</h1>
        <span>{formatLongDate(date)} · Frequência: ______</span>
      </header>

      <div className={styles.body}>
        {sections.length === 0 && (
          <p className={styles.empty}>Nenhum campo deste domingo foi preenchido.</p>
        )}
        {sections.map(({ group, roles }) => (
          <section className={styles.section} key={group}>
            <h2>{group}</h2>
            {roles.map((role) => (
              <div className={styles.row} key={role.key}>
                <strong>{role.label}:</strong>
                <span>{role.value}</span>
              </div>
            ))}
            {group === "Sacramento" && <p className={styles.note}>{SACRAMENT_NOTE}</p>}
          </section>
        ))}
      </div>
    </article>
  );
}
