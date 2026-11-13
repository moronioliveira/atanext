import type { PrintableSection, SundaySchedule } from "@/types/meeting";
import { getMeetingGroups, getRolesByGroup } from "./schedule";

/**
 * Seções da ata somente com os campos preenchidos. Campos vazios (ou só
 * com espaços) não aparecem, e seções sem nenhum campo preenchido são
 * omitidas por completo.
 */
export function getPrintableSections(
  schedule: SundaySchedule,
  sundayNumber: number,
): PrintableSection[] {
  return getMeetingGroups(sundayNumber)
    .map((group) => ({
      group,
      roles: getRolesByGroup(sundayNumber, group)
        .map((role) => ({
          key: role.key,
          label: role.label,
          value: (schedule[role.key] ?? "").trim(),
        }))
        .filter((role) => role.value !== ""),
    }))
    .filter((section) => section.roles.length > 0);
}
