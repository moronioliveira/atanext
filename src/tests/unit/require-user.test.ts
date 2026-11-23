import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  auth: { getSession },
  assertAuthConfiguration: () => {},
}));

vi.mock("@/lib/database", () => ({ sql: vi.fn() }));

vi.mock("next/server", async (importOriginal) => {
  const original = await importOriginal<typeof import("next/server")>();

  return { ...original, connection: async () => {} };
});

const { requireUser } = await import("@/lib/ward/membership");

describe("requireUser", () => {
  beforeEach(() => {
    getSession.mockReset();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("responde 401 quando não há sessão", async () => {
    getSession.mockResolvedValue({ data: null, error: null });

    const guard = await requireUser();

    expect(guard.ok).toBe(false);
    expect(!guard.ok && guard.response.status).toBe(401);
  });

  it("responde 503 quando o serviço de autenticação falha", async () => {
    getSession.mockResolvedValue({ data: null, error: { status: 502, code: "ECONNRESET" } });

    const guard = await requireUser();

    expect(!guard.ok && guard.response.status).toBe(503);
  });

  it("responde 503 quando a verificação lança erro", async () => {
    getSession.mockRejectedValue(new Error("falha de rede"));

    const guard = await requireUser();

    expect(!guard.ok && guard.response.status).toBe(503);
  });

  it("devolve o usuário quando a sessão é válida", async () => {
    const user = { id: "user-1", email: "pessoa@example.test" };

    getSession.mockResolvedValue({ data: { user }, error: null });

    await expect(requireUser()).resolves.toEqual({ ok: true, user });
  });
});
