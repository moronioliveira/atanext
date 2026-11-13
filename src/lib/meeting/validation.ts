import { meetingRoles, SUNDAYS_PER_MONTH } from "@/data/meeting-roles";
import type { MonthKey, SundaySchedule } from "@/types/meeting";
import { isMonthKey } from "./dates";

export const ROLE_VALUE_MAX_LENGTH = 500;

export function isValidSchedule(value: unknown): value is SundaySchedule {
  if (!value || typeof value !== "object") {
    return false;
  }

  const schedule = value as Record<string, unknown>;

  return meetingRoles.every(({ key }) => {
    const roleValue = schedule[key];

    return typeof roleValue === "string" && roleValue.length <= ROLE_VALUE_MAX_LENGTH;
  });
}

export type PlanPayload = {
  month: MonthKey;
  sundays: SundaySchedule[];
};

/** Valida o corpo enviado para salvar o planejamento do mês. */
export function parsePlanPayload(body: unknown): PlanPayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const { month, sundays } = body as Record<string, unknown>;

  if (
    !isMonthKey(month) ||
    !Array.isArray(sundays) ||
    sundays.length !== SUNDAYS_PER_MONTH ||
    !sundays.every(isValidSchedule)
  ) {
    return null;
  }

  return { month, sundays };
}
