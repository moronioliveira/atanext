// Funções de domínio das reuniões. Todas são seguras para o navegador;
// o acesso ao banco fica em `plan-repository.ts` (somente servidor).
export {
  formatLongDate,
  formatMonthLabel,
  formatShortDate,
  getNextSundaySelection,
  getSundayDates,
  isMonthKey,
  shiftMonth,
  toMonthKey,
} from "./dates";
export { getPrintableSections } from "./minutes";
export { getSaveNotice } from "./notices";
export {
  createEmptyMonth,
  createEmptySunday,
  getMeetingGroups,
  getMeetingRoles,
  getMeetingTitle,
  getRolesByGroup,
  getScheduleProgress,
  hasScheduleContent,
  isHymnRole,
  isTestimonySunday,
} from "./schedule";
export { isValidSchedule, parsePlanPayload, ROLE_VALUE_MAX_LENGTH } from "./validation";
export type { PlanPayload } from "./validation";
