import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";

export type WardMembership = {
  wardId: string;
  wardName: string;
  role: "leader" | "administrator";
};

export async function getCurrentUser() {
  const { data: session, error } = await auth.getSession();

  if (error || !session?.user) {
    return null;
  }

  return session.user;
}

export async function getCurrentMembership() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const rows = await sql`
    SELECT
      wm.ward_id AS "wardId",
      w.name AS "wardName",
      wm.role
    FROM ward_members wm
    INNER JOIN wards w ON w.id = wm.ward_id
    WHERE wm.user_id = ${user.id}
      AND wm.status = 'active'
    ORDER BY w.created_at
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export function isLeader(membership: WardMembership | null) {
  return membership?.role === "leader";
}
