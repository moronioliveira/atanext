import { describe, expect, it } from "vitest";
import {
  createEmptyMonth,
  createEmptySunday,
  getSaveNotice,
  parsePlanPayload,
} from "@/lib/meeting";

describe("parsePlanPayload", () => {
  it("aceita um planejamento válido", () => {
    const payload = { month: "2026-11", sundays: createEmptyMonth() };

    expect(parsePlanPayload(payload)).toEqual(payload);
  });

  it.each([
    { label: "mês inválido", payload: { month: "2026-13", sundays: createEmptyMonth() } },
    {
      label: "menos de cinco domingos",
      payload: { month: "2026-11", sundays: [createEmptySunday()] },
    },
    {
      label: "campo ausente",
      payload: { month: "2026-11", sundays: [{}, ...createEmptyMonth().slice(1)] },
    },
    {
      label: "texto acima do limite",
      payload: {
        month: "2026-11",
        sundays: [
          { ...createEmptySunday(), anuncios: "a".repeat(501) },
          ...createEmptyMonth().slice(1),
        ],
      },
    },
    { label: "corpo vazio", payload: null },
  ])("rejeita $label", ({ payload }) => {
    expect(parsePlanPayload(payload)).toBeNull();
  });
});

describe("getSaveNotice", () => {
  it("informa quantos membros novos entraram na lista", () => {
    expect(getSaveNotice(0)).toBe("Planejamento salvo com sucesso.");
    expect(getSaveNotice(1)).toBe("Planejamento salvo. 1 novo membro foi adicionado à lista.");
    expect(getSaveNotice(3)).toBe("Planejamento salvo. 3 novos membros foram adicionados à lista.");
  });
});
