CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ward_members (
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('leader', 'administrator')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (ward_id, user_id)
);

CREATE TABLE IF NOT EXISTS ward_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  email TEXT NOT NULL CHECK (char_length(trim(email)) BETWEEN 3 AND 320),
  invited_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ward_id, email, status)
);

CREATE TABLE IF NOT EXISTS meeting_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  sundays JSONB NOT NULL,
  created_by TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ward_id, month)
);

CREATE INDEX IF NOT EXISTS ward_members_user_idx
  ON ward_members (user_id, status);

CREATE INDEX IF NOT EXISTS meeting_plans_ward_idx
  ON meeting_plans (ward_id, month);
