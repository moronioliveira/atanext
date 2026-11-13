import { describe, expect, it } from "vitest";
import { isUuid, readJsonBody, readString } from "@/lib/api/responses";
import { filterByName, filterSuggestions, toSearchKey } from "@/lib/text";
import {
  buildInviteLink,
  canDeleteInvitation,
  canRevokeInvitation,
  getInvitationStatusLabel,
  getWardRoleLabel,
  isValidEmail,
  normalizeEmail,
} from "@/lib/ward";

describe("search helpers", () => {
  it("ignora acentos e maiúsculas", () => {
    expect(toSearchKey("  Morôni ")).toBe("moroni");
  });

  it("só sugere a partir de dois caracteres e respeita o limite", () => {
    const names = ["Ana", "Anabela", "Mariana", "Juliana", "Ananias", "Luana"];

    expect(filterSuggestions(names, "a")).toEqual([]);
    expect(filterSuggestions(names, "an")).toHaveLength(5);
  });

  it("devolve a lista inteira quando a busca está vazia", () => {
    const people = [{ name: "Érica" }, { name: "Bruno" }];

    expect(filterByName(people, "")).toEqual(people);
    expect(filterByName(people, "eri")).toEqual([{ name: "Érica" }]);
  });
});

describe("ward rules", () => {
  it("traduz o papel na ala", () => {
    expect(getWardRoleLabel("leader")).toBe("Líder");
    expect(getWardRoleLabel("administrator")).toBe("Administrador");
  });

  it("normaliza e valida e-mails", () => {
    expect(normalizeEmail("  Pessoa@Exemplo.COM ")).toBe("pessoa@exemplo.com");
    expect(isValidEmail("pessoa@exemplo.com")).toBe(true);
    expect(isValidEmail("pessoa")).toBe(false);
  });

  it("monta o link de cadastro com o e-mail convidado", () => {
    expect(buildInviteLink("https://atas.test", " Pessoa@Exemplo.com")).toBe(
      "https://atas.test/auth/sign-up?email=pessoa%40exemplo.com",
    );
  });

  it("define as ações permitidas para cada convite", () => {
    const pending = { id: "1", email: "a@b.c", status: "pending" as const };
    const active = { ...pending, status: "accepted" as const, memberStatus: "active" as const };
    const revoked = { ...pending, status: "rejected" as const, memberStatus: "revoked" as const };

    expect(getInvitationStatusLabel(pending)).toBe("Convite pendente");
    expect(getInvitationStatusLabel(active)).toBe("Ativo na ala");
    expect(getInvitationStatusLabel(revoked)).toBe("Desvinculado");
    expect(canRevokeInvitation(active)).toBe(true);
    expect(canRevokeInvitation(revoked)).toBe(false);
    expect(canDeleteInvitation(revoked)).toBe(true);
    expect(canDeleteInvitation(pending)).toBe(false);
  });
});

describe("api helpers", () => {
  it("lê o corpo JSON e tolera corpos inválidos", async () => {
    const valid = new Request("https://atas.test", { method: "POST", body: '{"name":"Ana"}' });
    const invalid = new Request("https://atas.test", { method: "POST", body: "não é json" });

    expect(readString(await readJsonBody(valid), "name")).toBe("Ana");
    expect(await readJsonBody(invalid)).toBeNull();
    expect(readString(null, "name")).toBe("");
  });

  it("valida identificadores UUID", () => {
    expect(isUuid("3f2b8c4e-1a2b-4c3d-8e9f-0a1b2c3d4e5f")).toBe(true);
    expect(isUuid("1; DROP TABLE")).toBe(false);
  });
});
