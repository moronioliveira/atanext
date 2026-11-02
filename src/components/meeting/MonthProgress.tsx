type MonthProgressProps = {
  completedSundays: number;
};

export function MonthProgress({ completedSundays }: MonthProgressProps) {
  return (
    <div className={styles.progressCard}>
      <div>
        <span className={styles.progressLabel}>Planejamento do mês</span>
        <strong>{completedSundays} de 5 domingos iniciados</strong>
      </div>
      <div className={styles.progressTrack}>
        <span style={{ width: `${completedSundays * 20}%` }} />
      </div>
      <span className={styles.progressHelp}>
        As alterações ficam disponíveis neste navegador durante o protótipo.
      </span>
    </div>
  );
}

import styles from "./meeting.module.css";
