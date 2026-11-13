import { describe, expect, it } from "vitest";
import {
  formatLongDate,
  formatMonthLabel,
  getNextSundaySelection,
  getSundayDates,
  isMonthKey,
  shiftMonth,
} from "@/lib/meeting";

describe("getNextSundaySelection", () => {
  it.each([
    {
      today: [2026, 11, 10],
      month: "2026-11",
      sunday: 3,
      label: "terça → domingo da mesma semana",
    },
    { today: [2026, 11, 15], month: "2026-11", sunday: 3, label: "domingo → o próprio dia" },
    { today: [2026, 11, 29], month: "2026-11", sunday: 5, label: "quinto domingo do mês" },
    { today: [2026, 11, 30], month: "2026-12", sunday: 1, label: "virada para o mês seguinte" },
    { today: [2026, 12, 28], month: "2027-01", sunday: 1, label: "virada de ano" },
  ])("$label", ({ today, month, sunday }) => {
    const [year, monthNumber, day] = today;
    const selection = getNextSundaySelection(new Date(year, monthNumber - 1, day));

    expect(selection).toEqual({ month, sundayIndex: sunday - 1 });
  });
});

describe("getSundayDates", () => {
  it("devolve os cinco domingos de um mês com cinco domingos", () => {
    const days = getSundayDates("2026-11").map((date) => date?.getDate());

    expect(days).toEqual([1, 8, 15, 22, 29]);
  });

  it("marca a quinta posição como vazia em meses com quatro domingos", () => {
    const dates = getSundayDates("2026-02");

    expect(dates).toHaveLength(5);
    expect(dates[4]).toBeNull();
  });

  it("devolve lista vazia para um mês inválido", () => {
    expect(getSundayDates("")).toEqual([]);
    expect(getSundayDates("2026-13")).toEqual([]);
  });
});

describe("month helpers", () => {
  it("valida o formato AAAA-MM", () => {
    expect(isMonthKey("2026-11")).toBe(true);
    expect(isMonthKey("2026-1")).toBe(false);
    expect(isMonthKey(null)).toBe(false);
  });

  it("avança e volta meses atravessando o ano", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
  });

  it("formata o mês por extenso em português", () => {
    expect(formatMonthLabel("2026-11")).toBe("novembro de 2026");
  });

  it("usa um texto padrão quando a data não existe", () => {
    expect(formatLongDate(null)).toBe("Data a definir");
    expect(formatLongDate(new Date(2026, 10, 15))).toBe("15 de novembro de 2026");
  });
});
