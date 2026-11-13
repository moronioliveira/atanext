import { NextResponse } from "next/server";

/** Resposta de erro padrão das rotas da API: `{ error: "mensagem" }`. */
export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Lê o corpo JSON da requisição; devolve `null` se ele estiver ausente ou inválido. */
export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();

    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function readString(body: Record<string, unknown> | null, key: string) {
  const value = body?.[key];

  return typeof value === "string" ? value : "";
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}
