import { NextResponse } from "next/server";
import { jsonError, readJsonBody, readString } from "@/lib/api/responses";
import { isValidEmail, normalizeEmail } from "@/lib/ward";
import {
  acceptInvitation,
  createInvitation,
  deleteRevokedInvitation,
  findManagedInvitationStatus,
  listPendingInvitationsForEmail,
  listWardInvitations,
  revokeInvitation,
} from "@/lib/ward/invitation-repository";
import { getMembershipForUser, requireLeader, requireUser } from "@/lib/ward/membership";

/**
 * Líder: lista os convites da ala.
 * Demais usuários: lista os convites pendentes para o próprio e-mail.
 */
export async function GET() {
  const guard = await requireUser();

  if (!guard.ok) {
    return guard.response;
  }

  const membership = await getMembershipForUser(guard.user.id);

  if (membership?.role === "leader") {
    const invitations = await listWardInvitations(membership.wardId);

    return NextResponse.json({ role: membership.role, invitations });
  }

  const invitations = await listPendingInvitationsForEmail(guard.user.email);

  return NextResponse.json({ role: null, invitations });
}

export async function POST(request: Request) {
  const guard = await requireLeader("Somente o líder pode convidar.");

  if (!guard.ok) {
    return guard.response;
  }

  const email = normalizeEmail(readString(await readJsonBody(request), "email"));

  if (!isValidEmail(email)) {
    return jsonError("Informe um e-mail válido.", 400);
  }

  await createInvitation({
    wardId: guard.membership.wardId,
    email,
    invitedBy: guard.user.id,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

/** Aceita um convite pendente para o e-mail do usuário logado. */
export async function PATCH(request: Request) {
  const guard = await requireUser();

  if (!guard.ok) {
    return guard.response;
  }

  const accepted = await acceptInvitation({
    invitationId: readString(await readJsonBody(request), "invitationId"),
    userId: guard.user.id,
    email: guard.user.email,
  });

  if (!accepted) {
    return jsonError("Convite não encontrado.", 404);
  }

  return NextResponse.json({ ok: true });
}

/**
 * Líder desvincula um administrador (`action` ausente) ou exclui um
 * registro já desvinculado (`action: "delete"`).
 */
export async function DELETE(request: Request) {
  const guard = await requireLeader("Somente o líder pode desvincular membros.");

  if (!guard.ok) {
    return guard.response;
  }

  const wardId = guard.membership.wardId;
  const body = await readJsonBody(request);
  const invitationId = readString(body, "invitationId");
  const action = readString(body, "action") === "delete" ? "delete" : "revoke";

  if (!invitationId) {
    return jsonError("Convite inválido.", 400);
  }

  const status = await findManagedInvitationStatus(wardId, invitationId);

  if (!status) {
    return jsonError("Membro não encontrado.", 404);
  }

  if (action === "delete") {
    if (status !== "rejected") {
      return jsonError("Somente registros desvinculados podem ser excluídos.", 409);
    }

    await deleteRevokedInvitation(wardId, invitationId);

    return NextResponse.json({ ok: true });
  }

  if (status !== "accepted") {
    return jsonError("Membro já está desvinculado.", 409);
  }

  await revokeInvitation(wardId, invitationId);

  return NextResponse.json({ ok: true });
}
