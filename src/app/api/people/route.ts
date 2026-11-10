import { NextResponse } from "next/server";
import { assertAuthConfiguration } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { normalizePersonName, validatePersonName } from "@/lib/people";
import { getCurrentMembership } from "@/lib/ward";

export async function GET() {
  assertAuthConfiguration();
  const membership = await getCurrentMembership();

  if (!membership) {
    return NextResponse.json({ error: "Ala não encontrada." }, { status: 403 });
  }

  const people = await sql`
    SELECT id, name
    FROM ward_people
    WHERE ward_id = ${membership.wardId}
    ORDER BY lower(name)
  `;

  return NextResponse.json({ people });
}

export async function POST(request: Request) {
  assertAuthConfiguration();
  const membership = await getCurrentMembership();

  if (!membership) {
    return NextResponse.json({ error: "Ala não encontrada." }, { status: 403 });
  }

  const body = await request.json();
  const name = normalizePersonName(
    typeof body.name === "string" ? body.name : "",
  );
  const validationError = validatePersonName(name);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const people = await sql`
    INSERT INTO ward_people (ward_id, name)
    VALUES (${membership.wardId}, ${name})
    ON CONFLICT (ward_id, lower(name)) DO NOTHING
    RETURNING id, name
  `;

  if (people.length === 0) {
    return NextResponse.json(
      { error: "Este membro já está cadastrado." },
      { status: 409 },
    );
  }

  return NextResponse.json({ person: people[0] }, { status: 201 });
}
