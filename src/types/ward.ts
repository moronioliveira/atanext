export type WardRole = "leader" | "administrator";

export type WardMembership = {
  wardId: string;
  wardName: string;
  role: WardRole;
};

export type InvitationStatus = "pending" | "accepted" | "rejected";
export type MemberStatus = "active" | "pending" | "revoked";

export type WardInvitation = {
  id: string;
  email: string;
  status: InvitationStatus;
  memberStatus?: MemberStatus | null;
};

export type WardSummary = {
  id: string;
  name: string;
  createdAt: string;
  activeMembers: number;
  pendingInvitations: number;
};
