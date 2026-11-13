import { Button } from "@/components/ui/Button";
import { formatMonthLabel, shiftMonth } from "@/lib/meeting";
import type { MonthKey } from "@/types/meeting";
import styles from "./Planner.module.css";

type MonthSwitcherProps = {
  month: MonthKey | null;
  onChange: (month: MonthKey) => void;
};

/** Troca o mês do planejamento com setas: "‹ novembro de 2026 ›". */
export function MonthSwitcher({ month, onChange }: MonthSwitcherProps) {
  const label = month ? formatMonthLabel(month) : "Carregando...";

  return (
    <div className={styles.monthSwitcher}>
      <Button
        variant="secondary"
        size="sm"
        icon="chevronLeft"
        disabled={!month}
        onClick={() => month && onChange(shiftMonth(month, -1))}
      >
        <span className="sr-only">Mês anterior</span>
      </Button>
      <p className={styles.monthLabel} aria-live="polite">
        {label}
      </p>
      <Button
        variant="secondary"
        size="sm"
        icon="chevronRight"
        disabled={!month}
        onClick={() => month && onChange(shiftMonth(month, 1))}
      >
        <span className="sr-only">Próximo mês</span>
      </Button>
    </div>
  );
}
