"use client";

import {
  formatLongDate,
  formatShortDate,
} from "@/lib/meeting-utils";
import {
  getMeetingGroups,
  getMeetingRoles,
  type SundaySchedule,
} from "@/types/meeting";
import styles from "./meeting.module.css";
import { usePreviewScale, usePrintFit } from "./usePrintFit";

type PrintPreviewProps = {
  data: SundaySchedule;
  date: Date | null;
  sunday: number;
  onClose: () => void;
};

export function PrintPreview({
  data,
  date,
  sunday,
  onClose,
}: PrintPreviewProps) {
  const roles = getMeetingRoles(sunday);
  const groups = getMeetingGroups(sunday);
  const { stageRef, pageRef } = usePreviewScale<HTMLElement>();
  const contentKey = JSON.stringify({ data, sunday });

  usePrintFit(pageRef, contentKey);

  return (
    <div className={styles.previewOverlay}>
      <div className={`${styles.previewToolbar} ${styles.noPrint}`}>
        <button className={styles.secondaryButton} onClick={onClose}>
          ← Voltar para edição
        </button>
        <div>
          <strong>Prévia da ata</strong>
          <span>
            Domingo {sunday} · {formatShortDate(date)}
          </span>
        </div>
        <button className={styles.primaryButton} onClick={() => window.print()}>
          Imprimir / PDF <span>↗</span>
        </button>
      </div>
      <div className={styles.printStage} ref={stageRef}>
        <article className={styles.printPage} ref={pageRef}>
          <header className={styles.printHeader}>
            <p>
              {sunday === 1
                ? "REUNIÃO DE TESTEMUNHOS"
                : "REUNIÃO SACRAMENTAL"}
            </p>
            <h1>Ala Dom Pedro II</h1>
            <span>
              {formatLongDate(date)} · Frequência: ______
            </span>
          </header>
          <div className={styles.printBody}>
            {groups.map((group) => (
              <section className={styles.printSection} key={group}>
                <h2>{group}</h2>
                {roles
                  .filter((role) => role.group === group)
                  .map((role) => (
                    <div className={styles.printRow} key={role.key}>
                      <strong>{role.label}:</strong>
                      <span>
                        {data[role.key] || "________________________________________"}
                      </span>
                    </div>
                  ))}
                {group === "Sacramento" && (
                  <p className={styles.printNote}>
                    Após o hino o sacramento será abençoado e distribuído a todos.
                  </p>
                )}
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
