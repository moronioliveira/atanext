import { sql } from "@/lib/database";
import type { WardSummary } from "@/types/ward";

/** Somente servidor: cadastro e exclusão de alas. */

export async function createWardWithLeader(name: string, userId: string) {
  const rows = await sql`
    INSERT INTO wards (name) VALUES (${name}) RETURNING id, name
  `;
  const ward = rows[0] as { id: string; name: string };

  await sql`
    INSERT INTO ward_members (ward_id, user_id, role)
    VALUES (${ward.id}, ${userId}, 'leader')
  `;

  return ward;
}

export async function revokeOwnMembership(wardId: string, userId: string) {
  await sql`
    UPDATE ward_members
    SET status = 'revoked'
    WHERE ward_id = ${wardId}
      AND user_id = ${userId}
  `;
}

/** Remove a ala; planejamentos, membros e convites são apagados em cascata. */
export async function deleteWard(wardId: string) {
  await sql`
    DELETE FROM wards
    WHERE id = ${wardId}
  `;
}

export async function listWardSummaries() {
  const rows = await sql`
    SELECT
      w.id,
      w.name,
      w.created_at AS "createdAt",
      COUNT(DISTINCT wm.user_id) FILTER (
        WHERE wm.status = 'active'
      )::int AS "activeMembers",
      COUNT(DISTINCT wi.id) FILTER (
        WHERE wi.status = 'pending'
      )::int AS "pendingInvitations"
    FROM wards w
    LEFT JOIN ward_members wm ON wm.ward_id = w.id
    LEFT JOIN ward_invitations wi ON wi.ward_id = w.id
    GROUP BY w.id
    ORDER BY w.created_at DESC
  `;

  return rows as WardSummary[];
}
