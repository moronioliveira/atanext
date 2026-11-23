/**
 * Chamadas à API feitas pelo navegador. Nunca lança erro: devolve
 * `{ ok: false, error }` com uma mensagem em português para exibir.
 */
export type ApiResult<TData> =
  { ok: true; data: TData } | { ok: false; error: string; status: number };

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  fallbackError: string;
};

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const body: unknown = await response.json();

    if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
      return body.error;
    }
  } catch {
    // Corpo vazio ou inválido: usa a mensagem padrão.
  }

  return fallback;
}

/** Tempo máximo de espera por uma resposta da API antes de mostrar erro. */
const REQUEST_TIMEOUT_MS = 20_000;

const TIMEOUT_ERROR = "O servidor está demorando para responder. Tente novamente em instantes.";

export async function requestJson<TData>(
  url: string,
  { method = "GET", body, fallbackError }: RequestOptions,
): Promise<ApiResult<TData>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: await readErrorMessage(response, fallbackError),
      };
    }

    return { ok: true, data: (await response.json()) as TData };
  } catch {
    if (controller.signal.aborted) {
      return { ok: false, status: 0, error: TIMEOUT_ERROR };
    }

    return {
      ok: false,
      status: 0,
      error: "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.",
    };
  } finally {
    clearTimeout(timer);
  }
}
