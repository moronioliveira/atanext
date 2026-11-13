import { NextResponse } from "next/server";
import { jsonError, readJsonBody, readString } from "@/lib/api/responses";
import { WARD_NAME_MAX_LENGTH, WARD_NAME_MIN_LENGTH } from "@/lib/ward";
import { getMembershipForUser, requireMembership, requireUser } from "@/lib/ward/membership";
import { createWardWithLeader, deleteWard, revokeOwnMembership } from "@/lib/ward/ward-repository";

export async function GET() {
  const guard = await requireMembership({ missingStatus: 404 });

  if (!guard.ok) {
    return guard.response;
  }

  return NextResponse.json({ ward: guard.membership });
}

export async function POST(request: Request) {
  const guard = await requireUser();

  if (!guard.ok) {
    return guard.response;
  }

  if (await getMembershipForUser(guard.user.id)) {
    return jsonError("Usuário já pertence a uma ala.", 409);
  }

  const name = readString(await readJsonBody(request), "name").trim();

  if (name.length < WARD_NAME_MIN_LENGTH || name.length > WARD_NAME_MAX_LENGTH) {
    return jsonError("Informe um nome de ala válido.", 400);
  }

  const ward = await createWardWithLeader(name, guard.user.id);

  return NextResponse.json({ ward }, { status: 201 });
}

/**
 * `action: "leave"` — administrador sai da ala.
 * `action: "delete"` — líder exclui a ala, confirmando o nome exato.
 */
export async function DELETE(request: Request) {
  const guard = await requireMembership({ missingStatus: 404 });

  if (!guard.ok) {
    return guard.response;
  }

  const { membership, user } = guard;
  const body = await readJsonBody(request);
  const action = readString(body, "action");

  if (action === "leave") {
    if (membership.role === "leader") {
      return jsonError("O líder deve excluir a ala ou transferir a liderança antes de sair.", 409);
    }

    await revokeOwnMembership(membership.wardId, user.id);

    return NextResponse.json({ ok: true });
  }

  if (action !== "delete" || membership.role !== "leader") {
    return jsonError("Ação não autorizada.", 403);
  }

  if (readString(body, "confirmation") !== membership.wardName) {
    return jsonError("Digite o nome exato da ala para confirmar a exclusão.", 400);
  }

  await deleteWard(membership.wardId);

  return NextResponse.json({ ok: true });
}
