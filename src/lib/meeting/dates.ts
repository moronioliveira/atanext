import { SUNDAYS_PER_MONTH } from "@/data/meeting-roles";
import type { MonthKey, SundaySelection } from "@/types/meeting";

const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isMonthKey(value: unknown): value is MonthKey {
  return typeof value === "string" && MONTH_KEY_PATTERN.test(value);
}

export function toMonthKey(date: Date): MonthKey {
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${date.getFullYear()}-${month}`;
}

function parseMonthKey(month: MonthKey) {
  const [year, monthNumber] = month.split("-").map(Number);

  return { year, monthNumber };
}

/** Soma (ou subtrai) meses: `shiftMonth("2026-12", 1)` → `"2027-01"`. */
export function shiftMonth(month: MonthKey, amount: number): MonthKey {
  const { year, monthNumber } = parseMonthKey(month);

  return toMonthKey(new Date(year, monthNumber - 1 + amount, 1));
}

/**
 * Datas dos domingos do mês. Sempre devolve cinco posições; quando o mês
 * tem só quatro domingos, a quinta é `null`.
 */
export function getSundayDates(month: MonthKey): Array<Date | null> {
  if (!isMonthKey(month)) {
    return [];
  }

  const { year, monthNumber } = parseMonthKey(month);
  const firstDay = new Date(year, monthNumber - 1, 1);
  const firstSunday = 1 + ((7 - firstDay.getDay()) % 7);
  const lastDay = new Date(year, monthNumber, 0).getDate();

  return Array.from({ length: SUNDAYS_PER_MONTH }, (_, index) => {
    const day = firstSunday + index * 7;

    return day <= lastDay ? new Date(year, monthNumber - 1, day) : null;
  });
}

/**
 * Mês e posição (0 a 4) do próximo domingo a partir de `today`.
 * Se `today` já for domingo, ele próprio é escolhido.
 */
export function getNextSundaySelection(today: Date): SundaySelection {
  const daysUntilSunday = (7 - today.getDay()) % 7;
  const nextSunday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + daysUntilSunday,
  );

  return {
    month: toMonthKey(nextSunday),
    sundayIndex: Math.floor((nextSunday.getDate() - 1) / 7),
  };
}

export function formatShortDate(date: Date | null) {
  if (!date) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .replace(".", "");
}

export function formatLongDate(date: Date | null) {
  if (!date) {
    return "Data a definir";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(date);
}

/** `"2026-11"` → `"novembro de 2026"`. */
export function formatMonthLabel(month: MonthKey) {
  if (!isMonthKey(month)) {
    return "";
  }

  const { year, monthNumber } = parseMonthKey(month);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1));
}
