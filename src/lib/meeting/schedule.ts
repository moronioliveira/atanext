import {
  meetingGroups,
  meetingRoles,
  SUNDAYS_PER_MONTH,
  TESTIMONY_SUNDAY_NUMBER,
} from "@/data/meeting-roles";
import type { MeetingGroup, MeetingRole, RoleKey, SundaySchedule } from "@/types/meeting";

export function isTestimonySunday(sundayNumber: number) {
  return sundayNumber === TESTIMONY_SUNDAY_NUMBER;
}

/** Grupo que não existe no domingo informado. */
function getExcludedGroup(sundayNumber: number): MeetingGroup {
  return isTestimonySunday(sundayNumber) ? "Discursantes" : "Testemunhos";
}

export function getMeetingRoles(sundayNumber: number): MeetingRole[] {
  const excludedGroup = getExcludedGroup(sundayNumber);

  return meetingRoles.filter((role) => role.group !== excludedGroup);
}

export function getMeetingGroups(sundayNumber: number): MeetingGroup[] {
  const excludedGroup = getExcludedGroup(sundayNumber);

  return meetingGroups.filter((group) => group !== excludedGroup);
}

export function getRolesByGroup(sundayNumber: number, group: MeetingGroup) {
  return getMeetingRoles(sundayNumber).filter((role) => role.group === group);
}

export function isHymnRole(roleKey: RoleKey) {
  return meetingRoles.some((role) => role.key === roleKey && role.input === "hymn");
}

export function getMeetingTitle(sundayNumber: number) {
  return isTestimonySunday(sundayNumber) ? "Reunião de testemunhos" : "Reunião sacramental";
}

export function createEmptySunday(): SundaySchedule {
  return Object.fromEntries(meetingRoles.map(({ key }) => [key, ""])) as SundaySchedule;
}

export function createEmptyMonth(): SundaySchedule[] {
  return Array.from({ length: SUNDAYS_PER_MONTH }, createEmptySunday);
}

function isFilled(value: string | undefined) {
  return Boolean(value?.trim());
}

export function hasScheduleContent(schedule: SundaySchedule) {
  return Object.values(schedule).some(isFilled);
}

/** Quantos campos do domingo estão preenchidos e quantos existem. */
export function getScheduleProgress(schedule: SundaySchedule, sundayNumber: number) {
  const roles = getMeetingRoles(sundayNumber);
  const filled = roles.filter((role) => isFilled(schedule[role.key])).length;

  return {
    filled,
    total: roles.length,
  };
}
