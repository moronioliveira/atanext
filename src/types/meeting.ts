import type { meetingGroups, meetingRoles } from "@/data/meeting-roles";

export type MeetingRole = (typeof meetingRoles)[number];
export type RoleKey = MeetingRole["key"];
export type RoleInput = MeetingRole["input"];
export type MeetingGroup = (typeof meetingGroups)[number];

/** Valores digitados em cada função de um domingo. */
export type SundaySchedule = Record<RoleKey, string>;

/** Mês no formato `AAAA-MM`, como no campo `<input type="month">`. */
export type MonthKey = string;

export type SundaySelection = {
  month: MonthKey;
  sundayIndex: number;
};

export type PrintableRole = {
  key: RoleKey;
  label: string;
  value: string;
};

export type PrintableSection = {
  group: MeetingGroup;
  roles: PrintableRole[];
};
