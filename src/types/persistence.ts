import type { SundaySchedule } from "@/types/meeting";

export type PersistedPlan = {
  id: string;
  month: string;
  sundays: SundaySchedule[];
  updatedAt: string;
};
