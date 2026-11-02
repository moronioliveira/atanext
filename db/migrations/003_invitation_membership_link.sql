ALTER TABLE ward_members
  ADD COLUMN IF NOT EXISTS invitation_id UUID
  REFERENCES ward_invitations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS ward_members_invitation_idx
  ON ward_members (invitation_id);
