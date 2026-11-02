import { NextResponse } from "next/server";
import { assertAuthConfiguration, auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { getCurrentMembership } from "@/lib/ward";

export async function GET() {
  assertAuthConfiguration();
  const membership = await getCurrentMembership();

  if (!membership) {
    return NextResponse.json({ error: "Ala não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ward: membership });
}

export async function POST(request: Request) {
  assertAuthConfiguration();
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const existing = await getCurrentMembership();

  if (existing) {
    return NextResponse.json({ error: "Usuário já pertence a uma ala." }, { status: 409 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "Informe um nome de ala válido." }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO wards (name) VALUES (${name}) RETURNING id, name
  `;

  await sql`
    INSERT INTO ward_members (ward_id, user_id, role)
    VALUES (${rows[0].id}, ${session.user.id}, 'leader')
  `;

  return NextResponse.json({ ward: rows[0] }, { status: 201 });
}

export async function DELETE(request: Request) {
  assertAuthConfiguration();
  const { data: session } = await auth.getSession();
  const membership = await getCurrentMembership();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!membership) {
    return NextResponse.json({ error: "Ala não encontrada." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action === "leave") {
    if (membership.role === "leader") {
      return NextResponse.json(
        { error: "O líder deve excluir a ala ou transferir a liderança antes de sair." },
        { status: 409 },
      );
    }

    await sql`
      UPDATE ward_members
      SET status = 'revoked'
      WHERE ward_id = ${membership.wardId}
        AND user_id = ${session.user.id}
    `;

    return NextResponse.json({ ok: true });
  }

  if (action !== "delete" || membership.role !== "leader") {
    return NextResponse.json({ error: "Ação não autorizada." }, { status: 403 });
  }

  if (body?.confirmation !== membership.wardName) {
    return NextResponse.json(
      { error: "Digite o nome exato da ala para confirmar a exclusão." },
      { status: 400 },
    );
  }

  await sql`
    DELETE FROM wards
    WHERE id = ${membership.wardId}
  `;

  return NextResponse.json({ ok: true });
}
