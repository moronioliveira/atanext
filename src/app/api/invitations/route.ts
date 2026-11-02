import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { getCurrentMembership, getCurrentUser } from "@/lib/ward";

export async function GET() {
  const user = await getCurrentUser();
  const membership = await getCurrentMembership();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  if (membership?.role === "leader") {
    const invitations = await sql`
      SELECT id, email, status, created_at AS "createdAt"
      FROM ward_invitations
      WHERE ward_id = ${membership.wardId}
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ role: membership.role, invitations });
  }

  const invitations = await sql`
    SELECT id, email, ward_id AS "wardId"
    FROM ward_invitations
    WHERE lower(email) = lower(${user.email}) AND status = 'pending'
    ORDER BY created_at DESC
  `;

  return NextResponse.json({ role: null, invitations });
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  const membership = await getCurrentMembership();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (membership?.role !== "leader") {
    return NextResponse.json({ error: "Somente o líder pode convidar." }, { status: 403 });
  }

  const body = await request.json();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !email.includes("@") || email.length > 320) {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }

  await sql`
    INSERT INTO ward_invitations (ward_id, email, invited_by)
    VALUES (${membership.wardId}, ${email}, ${session.user.id})
  `;

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const invitationId = typeof body.invitationId === "string" ? body.invitationId : "";

  const invitations = await sql`
    SELECT id, ward_id AS "wardId"
    FROM ward_invitations
    WHERE id = ${invitationId}
      AND lower(email) = lower(${user.email})
      AND status = 'pending'
  `;

  const invitation = invitations[0];
  if (!invitation) {
    return NextResponse.json({ error: "Convite não encontrado." }, { status: 404 });
  }

  await sql`
    INSERT INTO ward_members (ward_id, user_id, role)
    VALUES (${invitation.wardId}, ${user.id}, 'administrator')
    ON CONFLICT (ward_id, user_id) DO UPDATE SET status = 'active', role = 'administrator'
  `;
  await sql`
    UPDATE ward_invitations SET status = 'accepted' WHERE id = ${invitation.id}
  `;

  return NextResponse.json({ ok: true });
}
