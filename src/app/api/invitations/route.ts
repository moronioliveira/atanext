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
      SELECT
        wi.id,
        wi.email,
        wi.status,
        wi.created_at AS "createdAt",
        wm.status AS "memberStatus",
        wm.role AS "memberRole"
      FROM ward_invitations wi
      LEFT JOIN ward_members wm ON wm.invitation_id = wi.id
      WHERE wi.ward_id = ${membership.wardId}
      ORDER BY wi.created_at DESC
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
    INSERT INTO ward_members (ward_id, user_id, role, invitation_id)
    VALUES (${invitation.wardId}, ${user.id}, 'administrator', ${invitation.id})
    ON CONFLICT (ward_id, user_id) DO UPDATE
      SET status = 'active',
          role = 'administrator',
          invitation_id = ${invitation.id}
  `;
  await sql`
    UPDATE ward_invitations SET status = 'accepted' WHERE id = ${invitation.id}
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  const membership = await getCurrentMembership();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!membership) {
    return NextResponse.json({ error: "Ala não encontrada." }, { status: 404 });
  }
  if (membership.role !== "leader") {
    return NextResponse.json({ error: "Somente o líder pode desvincular membros." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const invitationId = typeof body?.invitationId === "string" ? body.invitationId : "";
  const action = body?.action === "delete" ? "delete" : "revoke";

  if (!invitationId) {
    return NextResponse.json({ error: "Convite inválido." }, { status: 400 });
  }

  const rows = await sql`
    SELECT id, status
    FROM ward_invitations
    WHERE id = ${invitationId}
      AND ward_id = ${membership.wardId}
      AND status IN ('accepted', 'rejected')
  `;

  if (!rows[0]) {
    return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
  }

  if (action === "delete") {
    if (rows[0].status !== "rejected") {
      return NextResponse.json(
        { error: "Somente registros desvinculados podem ser excluídos." },
        { status: 409 },
      );
    }

    await sql`
      DELETE FROM ward_members
      WHERE ward_id = ${membership.wardId}
        AND invitation_id = ${invitationId}
        AND status = 'revoked'
    `;
    await sql`
      DELETE FROM ward_invitations
      WHERE id = ${invitationId}
        AND ward_id = ${membership.wardId}
        AND status = 'rejected'
    `;

    return NextResponse.json({ ok: true });
  }

  if (rows[0].status !== "accepted") {
    return NextResponse.json({ error: "Membro já está desvinculado." }, { status: 409 });
  }

  await sql`
    UPDATE ward_members
    SET status = 'revoked'
    WHERE ward_id = ${membership.wardId}
      AND invitation_id = ${invitationId}
      AND role = 'administrator'
      AND status = 'active'
  `;
  await sql`
    UPDATE ward_invitations
    SET status = 'rejected'
    WHERE id = ${invitationId}
  `;

  return NextResponse.json({ ok: true });
}
