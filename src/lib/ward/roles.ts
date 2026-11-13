import type { WardRole } from "@/types/ward";

const roleLabels: Record<WardRole, string> = {
  leader: "Líder",
  administrator: "Administrador",
};

export function getWardRoleLabel(role: WardRole) {
  return roleLabels[role];
}

export const WARD_NAME_MIN_LENGTH = 2;
export const WARD_NAME_MAX_LENGTH = 120;
