type MonthHeaderProps = {
  month: string;
  onMonthChange: (month: string) => void;
};

export function MonthHeader({ month, onMonthChange }: MonthHeaderProps) {
  return (
    <div className={styles.intro}>
      <div>
        <p className={`${styles.eyebrow} ${styles.accent}`}>
          Planejamento mensal
        </p>
        <h2>Organize sua próxima reunião.</h2>
        <p className={styles.muted}>
          Preencha as designações com calma. Você poderá revisar e imprimir a
          ata quando tudo estiver pronto.
        </p>
      </div>
      <label className={styles.monthPicker}>
        <span>Mês de planejamento</span>
        <input
          type="month"
          value={month}
          onChange={(event) => onMonthChange(event.target.value)}
        />
      </label>
    </div>
  );
}

import styles from "./meeting.module.css";
