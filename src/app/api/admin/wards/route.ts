import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";

export async function GET() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const wards = await sql`
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

  return NextResponse.json({ wards });
}
