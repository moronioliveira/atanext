import { Spinner } from "@/components/ui/Spinner";
import { getMeetingGroups, getRolesByGroup } from "@/lib/meeting";
import type { MeetingRole, RoleKey, SundaySchedule } from "@/types/meeting";
import { MeetingSection } from "./MeetingSection";
import styles from "./Planner.module.css";

type SundayEditorProps = {
  sundayNumber: number;
  schedule: SundaySchedule;
  loading: boolean;
  getOptions: (role: MeetingRole) => readonly string[];
  onChange: (roleKey: RoleKey, value: string) => void;
};

/** Formulário do domingo selecionado, dividido nas seções da reunião. */
export function SundayEditor({
  sundayNumber,
  schedule,
  loading,
  getOptions,
  onChange,
}: SundayEditorProps) {
  return (
    <div
      className={styles.editor}
      role="tabpanel"
      id="sunday-panel"
      aria-labelledby={`sunday-tab-${sundayNumber - 1}`}
      aria-busy={loading}
    >
      {loading ? (
        <div className={styles.editorLoading}>
          <Spinner label="Carregando planejamento salvo" />
          <span>Carregando planejamento salvo...</span>
        </div>
      ) : (
        getMeetingGroups(sundayNumber).map((group) => (
          <MeetingSection
            key={group}
            group={group}
            roles={getRolesByGroup(sundayNumber, group)}
            schedule={schedule}
            getOptions={getOptions}
            onChange={onChange}
          />
        ))
      )}
    </div>
  );
}
