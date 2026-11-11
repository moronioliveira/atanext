import {
  getMeetingGroups,
  getMeetingRoles,
  meetingRoles,
  type MeetingGroup,
  type RoleKey,
  type SundaySchedule,
} from "@/types/meeting";

export function createEmptySunday(): SundaySchedule {
  return Object.fromEntries(
    meetingRoles.map(({ key }) => [key, ""]),
  ) as SundaySchedule;
}

export function createEmptyMonth() {
  return Array.from({ length: 5 }, createEmptySunday);
}

export function getSundayDates(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);

  if (!year || !monthNumber) {
    return [];
  }

  const firstDay = new Date(year, monthNumber - 1, 1);
  const firstSunday = 1 + ((7 - firstDay.getDay()) % 7);
  const lastDay = new Date(year, monthNumber, 0).getDate();

  return Array.from({ length: 5 }, (_, index) => {
    const day = firstSunday + index * 7;

    return day <= lastDay ? new Date(year, monthNumber - 1, day) : null;
  });
}

export function formatShortDate(date: Date | null) {
  if (!date) {
    return "Data a definir";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function formatLongDate(date: Date | null) {
  if (!date) {
    return "Data a definir";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(date);
}

export function hasScheduleContent(schedule: SundaySchedule) {
  return Object.values(schedule).some(Boolean);
}

export function getRoleValue(
  schedule: SundaySchedule,
  roleKey: RoleKey,
) {
  return schedule[roleKey];
}

export type PrintableRole = {
  key: RoleKey;
  label: string;
  value: string;
};

export type PrintableSection = {
  group: MeetingGroup;
  roles: PrintableRole[];
};

/**
 * Monta as seções da ata somente com os campos preenchidos. Campos vazios
 * (ou só com espaços) não aparecem, e seções sem nenhum campo preenchido
 * são omitidas por completo.
 */
export function getPrintableSections(
  schedule: SundaySchedule,
  sundayNumber: number,
): PrintableSection[] {
  const roles = getMeetingRoles(sundayNumber);

  return getMeetingGroups(sundayNumber)
    .map((group) => ({
      group,
      roles: roles
        .filter((role) => role.group === group)
        .map((role) => ({
          key: role.key,
          label: role.label,
          value: (schedule[role.key] ?? "").trim(),
        }))
        .filter((role) => role.value !== ""),
    }))
    .filter((section) => section.roles.length > 0);
}

export function getSaveNotice(addedPeopleCount: number) {
  if (addedPeopleCount === 0) {
    return "Planejamento salvo com sucesso.";
  }

  if (addedPeopleCount === 1) {
    return "Planejamento salvo com sucesso. 1 novo membro foi adicionado à lista.";
  }

  return `Planejamento salvo com sucesso. ${addedPeopleCount} novos membros foram adicionados à lista.`;
}

export type SundaySelection = {
  month: string;
  sundayIndex: number;
};

function formatMonthKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${date.getFullYear()}-${month}`;
}

/**
 * Retorna o mês e a posição (0 a 4) do próximo domingo a partir de
 * `today`. Se `today` já for domingo, ele próprio é escolhido.
 */
export function getNextSundaySelection(today: Date): SundaySelection {
  const daysUntilSunday = (7 - today.getDay()) % 7;
  const nextSunday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + daysUntilSunday,
  );

  return {
    month: formatMonthKey(nextSunday),
    sundayIndex: Math.floor((nextSunday.getDate() - 1) / 7),
  };
}
