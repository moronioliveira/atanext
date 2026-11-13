import { describe, expect, it } from "vitest";
import {
  createEmptyMonth,
  createEmptySunday,
  getMeetingGroups,
  getMeetingTitle,
  getPrintableSections,
  getScheduleProgress,
  hasScheduleContent,
  isHymnRole,
} from "@/lib/meeting";

describe("meeting groups", () => {
  it("o primeiro domingo tem testemunhos e não tem discursantes", () => {
    expect(getMeetingGroups(1)).toContain("Testemunhos");
    expect(getMeetingGroups(1)).not.toContain("Discursantes");
    expect(getMeetingTitle(1)).toBe("Reunião de testemunhos");
  });

  it("os demais domingos têm discursantes e não têm testemunhos", () => {
    expect(getMeetingGroups(3)).toContain("Discursantes");
    expect(getMeetingGroups(3)).not.toContain("Testemunhos");
    expect(getMeetingTitle(3)).toBe("Reunião sacramental");
  });

  it("identifica os campos de hino", () => {
    expect(isHymnRole("hinoSacramental")).toBe(true);
    expect(isHymnRole("presidida")).toBe(false);
  });
});

describe("schedule content", () => {
  it("cria um mês com cinco domingos vazios", () => {
    const month = createEmptyMonth();

    expect(month).toHaveLength(5);
    expect(month.every((sunday) => !hasScheduleContent(sunday))).toBe(true);
  });

  it("ignora campos preenchidos só com espaços", () => {
    const sunday = { ...createEmptySunday(), presidida: "   " };

    expect(hasScheduleContent(sunday)).toBe(false);
  });

  it("conta apenas os campos do tipo de reunião do domingo", () => {
    const sunday = {
      ...createEmptySunday(),
      presidida: "Ana Souza",
      primeiroOrador: "João Lima",
      tempoTestemunhos: "Livre",
    };

    expect(getScheduleProgress(sunday, 2)).toEqual({ filled: 2, total: 16 });
    expect(getScheduleProgress(sunday, 1)).toEqual({ filled: 2, total: 15 });
  });
});

describe("getPrintableSections", () => {
  it("omite campos vazios e seções sem conteúdo", () => {
    const sunday = {
      ...createEmptySunday(),
      presidida: "  Ana Souza ",
      dirigida: "",
      ultimaOracao: "João Lima",
    };

    expect(getPrintableSections(sunday, 2)).toEqual([
      {
        group: "Abertura",
        roles: [{ key: "presidida", label: "Presidida", value: "Ana Souza" }],
      },
      {
        group: "Encerramento",
        roles: [{ key: "ultimaOracao", label: "Última oração", value: "João Lima" }],
      },
    ]);
  });

  it("devolve lista vazia quando nada foi preenchido", () => {
    expect(getPrintableSections(createEmptySunday(), 2)).toEqual([]);
  });
});
