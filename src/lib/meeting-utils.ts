import { meetingRoles, type RoleKey, type SundaySchedule } from "@/types/meeting";

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
