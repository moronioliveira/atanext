import { connection } from "next/server";
import { assertAuthConfiguration, auth } from "@/lib/auth/server";
import {
  classifySessionResult,
  type SessionCheck,
  type SessionUser,
} from "@/lib/auth/session-check";
import { jsonError } from "@/lib/api/responses";
import { sql } from "@/lib/database";
import type { WardMembership } from "@/types/ward";

/** Somente servidor: identifica o usuário e a ala da requisição atual. */

export type { SessionUser };

const AUTH_UNAVAILABLE_MESSAGE =
  "Não foi possível verificar seu acesso agora. Aguarde alguns instantes e tente novamente.";

/**
 * Verifica a sessão da requisição atual. Uma falha do serviço de autenticação
 * volta como `unavailable`, nunca como sessão ausente.
 */
export async function checkCurrentSession(): Promise<SessionCheck> {
  let check: SessionCheck;

  try {
    check = classifySessionResult(await auth.getSession());
  } catch (error) {
    const reason = error instanceof Error ? error.name : "erro desconhecido";

    check = { status: "unavailable", reason };
  }

  if (check.status === "unavailable") {
    console.warn(`[auth] Verificação de sessão indisponível (${check.reason}).`);
  }

  return check;
}

export async function getMembershipForUser(userId: string): Promise<WardMembership | null> {
  const rows = await sql`
    SELECT
      wm.ward_id AS "wardId",
      w.name AS "wardName",
      wm.role
    FROM ward_members wm
    INNER JOIN wards w ON w.id = wm.ward_id
    WHERE wm.user_id = ${userId}
      AND wm.status = 'active'
    ORDER BY w.created_at
    LIMIT 1
  `;

  return (rows[0] as WardMembership | undefined) ?? null;
}

type UserGuard = { ok: true; user: SessionUser } | { ok: false; response: Response };

type MembershipGuard =
  { ok: true; user: SessionUser; membership: WardMembership } | { ok: false; response: Response };

/**
 * Exige uma sessão ativa: 401 quando não houver sessão e 503 quando o serviço
 * de autenticação não responder (o cliente mostra "tentar novamente" em vez
 * de mandar o usuário de volta ao login).
 */
export async function requireUser(): Promise<UserGuard> {
  // Rotas autenticadas nunca são pré-geradas no build: tudo abaixo roda só
  // quando chega uma requisição (e o build não depende das variáveis de auth).
  await connection();
  assertAuthConfiguration();
  const session = await checkCurrentSession();

  if (session.status === "unavailable") {
    return { ok: false, response: jsonError(AUTH_UNAVAILABLE_MESSAGE, 503) };
  }

  if (session.status === "signedOut") {
    return { ok: false, response: jsonError("Não autenticado.", 401) };
  }

  return { ok: true, user: session.user };
}

/**
 * Exige sessão (401) e vínculo ativo com uma ala (`missingStatus`, 403 por
 * padrão). Toda leitura e escrita de dados da ala deve passar por aqui.
 */
export async function requireMembership({ missingStatus = 403 } = {}): Promise<MembershipGuard> {
  const guard = await requireUser();

  if (!guard.ok) {
    return guard;
  }

  const membership = await getMembershipForUser(guard.user.id);

  if (!membership) {
    return { ok: false, response: jsonError("Ala não encontrada.", missingStatus) };
  }

  return { ok: true, user: guard.user, membership };
}

/** Exige que o usuário seja o líder da ala (403 para administradores). */
export async function requireLeader(message: string): Promise<MembershipGuard> {
  const guard = await requireMembership({ missingStatus: 404 });

  if (guard.ok && guard.membership.role !== "leader") {
    return { ok: false, response: jsonError(message, 403) };
  }

  return guard;
}
