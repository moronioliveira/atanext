import { describe, expect, it, vi } from "vitest";
import { TimeoutError, withTimeout } from "@/lib/async/timeout";
import { classifySessionResult } from "@/lib/auth/session-check";
import {
  AUTH_CONNECTION_ERROR,
  AUTH_TIMEOUT_ERROR,
  getSignInErrorMessage,
  getThrownSignInErrorMessage,
  SIGN_IN_ERROR,
} from "@/features/auth/errors";

const USER = { id: "user-1", email: "pessoa@example.test" };

describe("classifySessionResult", () => {
  it("reconhece uma sessão válida", () => {
    expect(classifySessionResult({ data: { user: USER }, error: null })).toEqual({
      status: "signedIn",
      user: USER,
    });
  });

  it("trata ausência de sessão como usuário deslogado", () => {
    expect(classifySessionResult({ data: null, error: null })).toEqual({ status: "signedOut" });
    expect(classifySessionResult({ data: { user: null }, error: null })).toEqual({
      status: "signedOut",
    });
  });

  it("trata 401 e 403 como usuário deslogado", () => {
    expect(classifySessionResult({ data: null, error: { status: 401 } }).status).toBe("signedOut");
    expect(classifySessionResult({ data: null, error: { status: 403 } }).status).toBe("signedOut");
  });

  it("não confunde falha do serviço com sessão ausente", () => {
    const outage = classifySessionResult({
      data: null,
      error: { status: 502, code: "ECONNRESET" },
    });
    const unknown = classifySessionResult({ data: null, error: {} });

    expect(outage.status).toBe("unavailable");
    expect(unknown.status).toBe("unavailable");
  });
});

describe("getSignInErrorMessage", () => {
  it("culpa o e-mail e a senha somente em erros do usuário", () => {
    expect(getSignInErrorMessage({ status: 401 })).toBe(SIGN_IN_ERROR);
    expect(getSignInErrorMessage({ status: 400 })).toBe(SIGN_IN_ERROR);
  });

  it("lê o status de erros lançados pelo cliente de autenticação", () => {
    const wrongPassword = Object.assign(new Error("Invalid email or password"), { status: 401 });
    const serviceDown = Object.assign(new Error("Service unavailable"), { status: 503 });

    expect(getThrownSignInErrorMessage(wrongPassword)).toBe(SIGN_IN_ERROR);
    expect(getThrownSignInErrorMessage(serviceDown)).toBe(AUTH_CONNECTION_ERROR);
    expect(getThrownSignInErrorMessage(new TypeError("Failed to fetch"))).toBe(
      AUTH_CONNECTION_ERROR,
    );
    expect(getThrownSignInErrorMessage(new TimeoutError(1_000))).toBe(AUTH_TIMEOUT_ERROR);
  });

  it("indica falha de conexão quando o serviço falha", () => {
    expect(getSignInErrorMessage({ status: 503 })).toBe(AUTH_CONNECTION_ERROR);
    expect(getSignInErrorMessage({ status: 429 })).toBe(AUTH_CONNECTION_ERROR);
    expect(getSignInErrorMessage({})).toBe(AUTH_CONNECTION_ERROR);
  });
});

describe("withTimeout", () => {
  it("devolve o resultado quando a operação termina a tempo", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 1_000)).resolves.toBe("ok");
  });

  it("rejeita com TimeoutError quando a operação não responde", async () => {
    vi.useFakeTimers();

    const pending = withTimeout(new Promise(() => {}), 1_000);
    const assertion = expect(pending).rejects.toBeInstanceOf(TimeoutError);

    await vi.advanceTimersByTimeAsync(1_000);
    await assertion;

    vi.useRealTimers();
  });
});
