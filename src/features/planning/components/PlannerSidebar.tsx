import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatLongDate, getMeetingTitle } from "@/lib/meeting";
import type { PlannerNotice } from "../hooks/usePlanner";
import styles from "./Planner.module.css";

type PlannerSidebarProps = {
  sundayNumber: number;
  date: Date | null;
  progress: { filled: number; total: number };
  saving: boolean;
  disabled: boolean;
  hasUnsavedChanges: boolean;
  notice: PlannerNotice | null;
  onSave: () => void;
  onPreview: () => void;
  onClear: () => void;
};

function getSaveStatus(saving: boolean, hasUnsavedChanges: boolean) {
  if (saving) {
    return { text: "Salvando...", className: styles.statusSaving };
  }

  if (hasUnsavedChanges) {
    return { text: "Alterações não salvas", className: styles.statusPending };
  }

  return { text: "Tudo salvo", className: styles.statusSaved };
}

/**
 * Resumo do domingo aberto e ações principais. Fica fixo ao lado no
 * computador e vira uma barra no rodapé em telas pequenas.
 */
export function PlannerSidebar({
  sundayNumber,
  date,
  progress,
  saving,
  disabled,
  hasUnsavedChanges,
  notice,
  onSave,
  onPreview,
  onClear,
}: PlannerSidebarProps) {
  const status = getSaveStatus(saving, hasUnsavedChanges);

  return (
    <aside className={styles.sidebar} aria-label="Resumo e ações do domingo">
      <div className={styles.summary}>
        <p className={styles.summaryEyebrow}>{getMeetingTitle(sundayNumber)}</p>
        <h2 className={styles.summaryTitle}>{formatLongDate(date)}</h2>
        <div className={styles.summaryProgress}>
          <div className={styles.summaryProgressText}>
            <span>Campos preenchidos</span>
            <strong>
              {progress.filled} de {progress.total}
            </strong>
          </div>
          <ProgressBar
            value={progress.filled}
            max={progress.total}
            label="Campos preenchidos do domingo"
          />
        </div>
      </div>

      <p className={`${styles.saveStatus} ${status.className}`} role="status">
        <Icon name={hasUnsavedChanges && !saving ? "edit" : "check"} size={14} />
        {status.text}
      </p>

      <div className={styles.sidebarActions}>
        <Button fullWidth icon="save" loading={saving} disabled={disabled} onClick={onSave}>
          Salvar planejamento
        </Button>
        <Button
          fullWidth
          variant="secondary"
          icon="fileText"
          disabled={disabled}
          onClick={onPreview}
        >
          Ver ata
        </Button>
      </div>

      {notice && (
        <div className={styles.sidebarNotice}>
          <Alert tone={notice.tone}>{notice.text}</Alert>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        icon="eraser"
        className={styles.clearButton}
        disabled={disabled || progress.filled === 0}
        onClick={onClear}
      >
        Limpar este domingo
      </Button>
    </aside>
  );
}
