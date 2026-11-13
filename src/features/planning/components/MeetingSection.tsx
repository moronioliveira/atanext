import type { MeetingGroup, MeetingRole, RoleKey, SundaySchedule } from "@/types/meeting";
import styles from "./Planner.module.css";
import { RoleField } from "./RoleField";

type MeetingSectionProps = {
  group: MeetingGroup;
  roles: MeetingRole[];
  schedule: SundaySchedule;
  getOptions: (role: MeetingRole) => readonly string[];
  onChange: (roleKey: RoleKey, value: string) => void;
};

/** Uma seção da reunião (Abertura, Sacramento...) com seus campos. */
export function MeetingSection({
  group,
  roles,
  schedule,
  getOptions,
  onChange,
}: MeetingSectionProps) {
  const filled = roles.filter((role) => schedule[role.key]?.trim()).length;
  const headingId = `section-${group}`;

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <header className={styles.sectionHeader}>
        <h3 id={headingId}>{group}</h3>
        <span className={styles.sectionCount}>
          {filled} de {roles.length}
        </span>
      </header>
      <div className={styles.fields}>
        {roles.map((role) => (
          <div key={role.key} className={role.input === "text" ? styles.fieldWide : undefined}>
            <RoleField
              role={role}
              value={schedule[role.key] ?? ""}
              options={getOptions(role)}
              onChange={(value) => onChange(role.key, value)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
