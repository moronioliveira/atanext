import { NextResponse, type NextRequest } from "next/server";
import { isUuid, jsonError, readJsonBody, readString } from "@/lib/api/responses";
import { isUniqueViolation } from "@/lib/database";
import { normalizePersonName, validatePersonName } from "@/lib/people";
import { deletePerson, renamePerson } from "@/lib/people/people-repository";
import { requireMembership } from "@/lib/ward/membership";

const NOT_FOUND_MESSAGE = "Membro não encontrado nesta ala.";

export async function PATCH(request: NextRequest, context: RouteContext<"/api/people/[id]">) {
  const guard = await requireMembership();

  if (!guard.ok) {
    return guard.response;
  }

  const { id } = await context.params;

  if (!isUuid(id)) {
    return jsonError(NOT_FOUND_MESSAGE, 404);
  }

  const name = normalizePersonName(readString(await readJsonBody(request), "name"));
  const validationError = validatePersonName(name);

  if (validationError) {
    return jsonError(validationError, 400);
  }

  try {
    const person = await renamePerson(guard.membership.wardId, id, name);

    if (!person) {
      return jsonError(NOT_FOUND_MESSAGE, 404);
    }

    return NextResponse.json({ person });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return jsonError("Já existe um membro com este nome.", 409);
    }

    throw error;
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext<"/api/people/[id]">) {
  const guard = await requireMembership();

  if (!guard.ok) {
    return guard.response;
  }

  const { id } = await context.params;

  if (!isUuid(id) || !(await deletePerson(guard.membership.wardId, id))) {
    return jsonError(NOT_FOUND_MESSAGE, 404);
  }

  return NextResponse.json({ deleted: id });
}
