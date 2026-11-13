import type { WardInvitation } from "@/types/ward";

export const EMAIL_MAX_LENGTH = 320;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return email.length > 0 && email.length <= EMAIL_MAX_LENGTH && email.includes("@");
}

/** Link de cadastro com o e-mail convidado já preenchido. */
export function buildInviteLink(origin: string, email: string) {
  const signUpUrl = new URL("/auth/sign-up", origin);

  signUpUrl.searchParams.set("email", normalizeEmail(email));

  return signUpUrl.toString();
}

export function getInvitationStatusLabel(invitation: WardInvitation) {
  if (invitation.status === "pending") {
    return "Convite pendente";
  }

  return invitation.memberStatus === "active" ? "Ativo na ala" : "Desvinculado";
}

/** Administrador ativo: pode ser desvinculado pelo líder. */
export function canRevokeInvitation(invitation: WardInvitation) {
  return invitation.status === "accepted" && invitation.memberStatus === "active";
}

/** Registro desvinculado: pode ser excluído da lista pelo líder. */
export function canDeleteInvitation(invitation: WardInvitation) {
  return invitation.status === "rejected" && invitation.memberStatus === "revoked";
}
