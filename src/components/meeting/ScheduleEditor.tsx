import type { ComponentType, FocusEvent } from "react";
import { AberturaModule } from "@/components/meeting/sessions/abertura/AberturaModule";
import { DiscursantesModule } from "@/components/meeting/sessions/discursantes/DiscursantesModule";
import { EncerramentoModule } from "@/components/meeting/sessions/encerramento/EncerramentoModule";
import {
  SacramentoModule,
} from "@/components/meeting/sessions/sacramento/SacramentoModule";
import {
  TestemunhosModule,
} from "@/components/meeting/sessions/testemunhos/TestemunhosModule";
import type { SessionModuleProps } from "@/components/meeting/sessions/SessionModule";
import {
  getMeetingGroups,
  getMeetingRoles,
  type MeetingGroup,
  type RoleKey,
  type SundaySchedule,
} from "@/types/meeting";
import styles from "./meeting.module.css";

type ScheduleEditorProps = {
  sundayNumber: number;
  schedule: SundaySchedule;
  suggestions: (roleKey: RoleKey) => string[];
  onChange: (roleKey: RoleKey, value: string) => void;
  onFocus: (
    roleKey: RoleKey,
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onSelect: (roleKey: RoleKey, value: string) => void;
  onClear: () => void;
  onPreview: () => void;
  onSave: () => void;
  notice: string;
};

const sessionModules: Record<
  MeetingGroup,
  ComponentType<SessionModuleProps>
> = {
  Abertura: AberturaModule,
  Sacramento: SacramentoModule,
  Discursantes: DiscursantesModule,
  Testemunhos: TestemunhosModule,
  Encerramento: EncerramentoModule,
};

export function ScheduleEditor({
  sundayNumber,
  schedule,
  suggestions,
  onChange,
  onFocus,
  onSelect,
  onClear,
  onPreview,
  onSave,
  notice,
}: ScheduleEditorProps) {
  const roles = getMeetingRoles(sundayNumber);
  const groups = getMeetingGroups(sundayNumber);

  function renderSession(group: MeetingGroup) {
    const SessionModule = sessionModules[group];

    return (
      <SessionModule
        key={group}
        roles={roles.filter((role) => role.group === group)}
        schedule={schedule}
        suggestions={suggestions}
        onChange={onChange}
        onFocus={onFocus}
        onSelect={onSelect}
      />
    );
  }

  return (
    <section className={styles.editorCard}>
      <div className={styles.cardHeading}>
        <div>
          <p className={`${styles.eyebrow} ${styles.accent}`}>
            Domingo {sundayNumber}
          </p>
          <h3>
            {sundayNumber === 1
              ? "Designações da reunião de testemunhos"
              : "Designações da reunião"}
          </h3>
        </div>
        <button className={styles.textButton} onClick={onClear}>
          Limpar domingo
        </button>
      </div>

      <div className={styles.moduleGrid}>
        {groups.map(renderSession)}
      </div>

      <div className={styles.editorActions}>
        <button className={styles.secondaryButton} onClick={onPreview}>
          Ver prévia
        </button>
        <button className={styles.primaryButton} onClick={onSave}>
          Salvar rascunho <span>→</span>
        </button>
      </div>
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
    </section>
  );
}
