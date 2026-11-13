import { sql } from "@/lib/database";
import type { InvitationStatus, WardInvitation } from "@/types/ward";

/** Somente servidor: convites de administradores e seus vínculos com a ala. */

export async function listWardInvitations(wardId: string) {
  const rows = await sql`
    SELECT
      wi.id,
      wi.email,
      wi.status,
      wi.created_at AS "createdAt",
      wm.status AS "memberStatus",
      wm.role AS "memberRole"
    FROM ward_invitations wi
    LEFT JOIN ward_members wm ON wm.invitation_id = wi.id
    WHERE wi.ward_id = ${wardId}
    ORDER BY wi.created_at DESC
  `;

  return rows as WardInvitation[];
}

export async function listPendingInvitationsForEmail(email: string) {
  const rows = await sql`
    SELECT id, email, ward_id AS "wardId"
    FROM ward_invitations
    WHERE lower(email) = lower(${email}) AND status = 'pending'
    ORDER BY created_at DESC
  `;

  return rows as Array<{ id: string; email: string; wardId: string }>;
}

type CreateInvitationInput = {
  wardId: string;
  email: string;
  invitedBy: string;
};

export async function createInvitation({ wardId, email, invitedBy }: CreateInvitationInput) {
  await sql`
    INSERT INTO ward_invitations (ward_id, email, invited_by)
    VALUES (${wardId}, ${email}, ${invitedBy})
  `;
}

type AcceptInvitationInput = {
  invitationId: string;
  userId: string;
  email: string;
};

/** Aceita um convite pendente do e-mail informado; devolve `false` se não existir. */
export async function acceptInvitation({ invitationId, userId, email }: AcceptInvitationInput) {
  const invitations = await sql`
    SELECT id, ward_id AS "wardId"
    FROM ward_invitations
    WHERE id = ${invitationId}
      AND lower(email) = lower(${email})
      AND status = 'pending'
  `;
  const invitation = invitations[0] as { id: string; wardId: string } | undefined;

  if (!invitation) {
    return false;
  }

  await sql`
    INSERT INTO ward_members (ward_id, user_id, role, invitation_id)
    VALUES (${invitation.wardId}, ${userId}, 'administrator', ${invitation.id})
    ON CONFLICT (ward_id, user_id) DO UPDATE
      SET status = 'active',
          role = 'administrator',
          invitation_id = ${invitation.id}
  `;
  await sql`
    UPDATE ward_invitations SET status = 'accepted' WHERE id = ${invitation.id}
  `;

  return true;
}

/** Status de um convite aceito ou desvinculado da ala, que o líder pode gerenciar. */
export async function findManagedInvitationStatus(wardId: string, invitationId: string) {
  const rows = await sql`
    SELECT id, status
    FROM ward_invitations
    WHERE id = ${invitationId}
      AND ward_id = ${wardId}
      AND status IN ('accepted', 'rejected')
  `;

  return (rows[0]?.status as InvitationStatus | undefined) ?? null;
}

export async function revokeInvitation(wardId: string, invitationId: string) {
  await sql`
    UPDATE ward_members
    SET status = 'revoked'
    WHERE ward_id = ${wardId}
      AND invitation_id = ${invitationId}
      AND role = 'administrator'
      AND status = 'active'
  `;
  await sql`
    UPDATE ward_invitations
    SET status = 'rejected'
    WHERE id = ${invitationId}
  `;
}

export async function deleteRevokedInvitation(wardId: string, invitationId: string) {
  await sql`
    DELETE FROM ward_members
    WHERE ward_id = ${wardId}
      AND invitation_id = ${invitationId}
      AND status = 'revoked'
  `;
  await sql`
    DELETE FROM ward_invitations
    WHERE id = ${invitationId}
      AND ward_id = ${wardId}
      AND status = 'rejected'
  `;
}
