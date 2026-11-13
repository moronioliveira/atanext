import { describe, expect, it } from "vitest";
import { createEmptySunday } from "@/lib/meeting";
import {
  collectPersonNames,
  extractPersonNames,
  normalizePersonName,
  personRoleKeys,
  sortPeopleByName,
  validatePersonName,
} from "@/lib/people";

describe("extractPersonNames", () => {
  it.each([
    { value: "Irismar Nunes de Oliveira (Bispo)", expected: ["Irismar Nunes de Oliveira"] },
    {
      value: "Jonatas Gomes (Coral) & Morôni Nascimento (Ala)",
      expected: ["Jonatas Gomes", "Morôni Nascimento"],
    },
    { value: "Ana / Bia; Carla\nDiego", expected: ["Ana", "Bia", "Carla", "Diego"] },
    { value: "   ", expected: [] },
  ])("extrai nomes de '$value'", ({ value, expected }) => {
    expect(extractPersonNames(value)).toEqual(expected);
  });

  it("ignora frases longas e trechos com números", () => {
    const recognition =
      "A Presidência da Estaca (Pres. Rodrigues, 1º Cons.) - Reconhecemos os Membros do Sumo Conselho da Estaca";

    expect(extractPersonNames(recognition)).toEqual([]);
    expect(extractPersonNames("Reunião às 19h")).toEqual([]);
  });
});

describe("collectPersonNames", () => {
  it("reúne nomes de todos os domingos sem repetir maiúsculas/minúsculas", () => {
    const sundays = [
      { ...createEmptySunday(), presidida: "Ana Souza (Bispo)", dirigida: "ana souza" },
      { ...createEmptySunday(), primeiroOrador: "João Lima" },
    ];

    expect(collectPersonNames(sundays)).toEqual(["Ana Souza", "João Lima"]);
  });

  it("não cadastra hinos nem textos livres", () => {
    const sunday = {
      ...createEmptySunday(),
      primeiroHino: "Um a Um",
      anuncios: "Maria Clara",
    };

    expect(collectPersonNames([sunday])).toEqual([]);
    expect(personRoleKeys).not.toContain("primeiroHino");
    expect(personRoleKeys).not.toContain("anuncios");
  });
});

describe("person name rules", () => {
  it("normaliza espaços", () => {
    expect(normalizePersonName("  Ana   Souza ")).toBe("Ana Souza");
  });

  it("valida o tamanho do nome", () => {
    expect(validatePersonName("A")).not.toBeNull();
    expect(validatePersonName("Ana")).toBeNull();
    expect(validatePersonName("a".repeat(161))).not.toBeNull();
  });

  it("ordena em ordem alfabética do português", () => {
    const people = [{ name: "Érica" }, { name: "Bruno" }, { name: "Ana" }];

    expect(sortPeopleByName(people).map((person) => person.name)).toEqual([
      "Ana",
      "Bruno",
      "Érica",
    ]);
  });
});
