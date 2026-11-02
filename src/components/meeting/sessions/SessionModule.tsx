import type { ChangeEvent, FocusEvent } from "react";
import { AutocompleteField } from "@/components/meeting/AutocompleteField";
import type { MeetingRole, RoleKey, SundaySchedule } from "@/types/meeting";
import styles from "../meeting.module.css";

export type SessionModuleProps = {
  roles: readonly MeetingRole[];
  schedule: SundaySchedule;
  suggestions: (roleKey: RoleKey) => string[];
  onChange: (roleKey: RoleKey, value: string) => void;
  onFocus: (
    roleKey: RoleKey,
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onSelect: (roleKey: RoleKey, value: string) => void;
};

type SessionModuleLayoutProps = SessionModuleProps & {
  title: string;
};

export function SessionModuleLayout({
  title,
  roles,
  schedule,
  suggestions,
  onChange,
  onFocus,
  onSelect,
}: SessionModuleLayoutProps) {
  return (
    <section className={styles.meetingModule}>
      <div className={styles.groupHeading}>
        <span>{title}</span>
        <div />
      </div>
      <div className={styles.roleList}>
        {roles.map((role) => (
          <AutocompleteField
            key={role.key}
            label={role.label}
            multiline={
              role.key === "anuncios" ||
              role.key === "chamados" ||
              role.key === "tempoTestemunhos"
            }
            value={schedule[role.key]}
            suggestions={suggestions(role.key)}
            onChange={(
              event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => onChange(role.key, event.target.value)}
            onFocus={(
              event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => onFocus(role.key, event)}
            onSelect={(value) => onSelect(role.key, value)}
          />
        ))}
      </div>
    </section>
  );
}
