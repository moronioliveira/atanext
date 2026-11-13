import { assertAuthConfiguration, auth } from "@/lib/auth/server";
import { jsonError } from "@/lib/api/responses";
import { sql } from "@/lib/database";
import type { WardMembership } from "@/types/ward";

/** Somente servidor: identifica o usuário e a ala da requisição atual. */

export type SessionUser = {
  id: string;
  email: string;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const { data: session, error } = await auth.getSession();

  if (error || !session?.user) {
    return null;
  }

  return session.user;
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

export async function getCurrentMembership() {
  const user = await getCurrentUser();

  return user ? getMembershipForUser(user.id) : null;
}

type UserGuard = { ok: true; user: SessionUser } | { ok: false; response: Response };

type MembershipGuard =
  { ok: true; user: SessionUser; membership: WardMembership } | { ok: false; response: Response };

/** Exige uma sessão ativa (401 quando não houver). */
export async function requireUser(): Promise<UserGuard> {
  assertAuthConfiguration();
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, response: jsonError("Não autenticado.", 401) };
  }

  return { ok: true, user };
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
