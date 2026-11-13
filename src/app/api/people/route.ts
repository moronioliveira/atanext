import { NextResponse } from "next/server";
import { jsonError, readJsonBody, readString } from "@/lib/api/responses";
import { normalizePersonName, validatePersonName } from "@/lib/people";
import { insertPerson, listPeople } from "@/lib/people/people-repository";
import { requireMembership } from "@/lib/ward/membership";

export async function GET() {
  const guard = await requireMembership();

  if (!guard.ok) {
    return guard.response;
  }

  const people = await listPeople(guard.membership.wardId);

  return NextResponse.json({ people });
}

export async function POST(request: Request) {
  const guard = await requireMembership();

  if (!guard.ok) {
    return guard.response;
  }

  const name = normalizePersonName(readString(await readJsonBody(request), "name"));
  const validationError = validatePersonName(name);

  if (validationError) {
    return jsonError(validationError, 400);
  }

  const person = await insertPerson(guard.membership.wardId, name);

  if (!person) {
    return jsonError("Este membro já está cadastrado.", 409);
  }

  return NextResponse.json({ person }, { status: 201 });
}
