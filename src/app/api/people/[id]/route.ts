import { NextResponse, type NextRequest } from "next/server";
import { assertAuthConfiguration } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { normalizePersonName, validatePersonName } from "@/lib/people";
import { getCurrentMembership } from "@/lib/ward";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNIQUE_VIOLATION = "23505";

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === UNIQUE_VIOLATION
  );
}

function notFound() {
  return NextResponse.json(
    { error: "Membro não encontrado nesta ala." },
    { status: 404 },
  );
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/people/[id]">,
) {
  assertAuthConfiguration();
  const membership = await getCurrentMembership();

  if (!membership) {
    return NextResponse.json({ error: "Ala não encontrada." }, { status: 403 });
  }

  const { id } = await context.params;

  if (!UUID_PATTERN.test(id)) {
    return notFound();
  }

  const body = await request.json();
  const name = normalizePersonName(
    typeof body.name === "string" ? body.name : "",
  );
  const validationError = validatePersonName(name);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const people = await sql`
      UPDATE ward_people
      SET name = ${name}
      WHERE id = ${id} AND ward_id = ${membership.wardId}
      RETURNING id, name
    `;

    if (people.length === 0) {
      return notFound();
    }

    return NextResponse.json({ person: people[0] });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "Já existe um membro com este nome." },
        { status: 409 },
      );
    }

    throw error;
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext<"/api/people/[id]">,
) {
  assertAuthConfiguration();
  const membership = await getCurrentMembership();

  if (!membership) {
    return NextResponse.json({ error: "Ala não encontrada." }, { status: 403 });
  }

  const { id } = await context.params;

  if (!UUID_PATTERN.test(id)) {
    return notFound();
  }

  const people = await sql`
    DELETE FROM ward_people
    WHERE id = ${id} AND ward_id = ${membership.wardId}
    RETURNING id
  `;

  if (people.length === 0) {
    return notFound();
  }

  return NextResponse.json({ deleted: people[0].id });
}
