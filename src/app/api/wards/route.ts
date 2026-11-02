import { NextResponse } from "next/server";
import { assertAuthConfiguration, auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { getCurrentMembership } from "@/lib/ward";

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
