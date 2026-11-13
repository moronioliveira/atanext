import { sql } from "@/lib/database";
import type { MonthKey, SundaySchedule } from "@/types/meeting";
import type { Person } from "@/types/people";

/** Somente servidor: leitura e gravação do planejamento mensal da ala. */

export type StoredPlan = {
  id: string;
  sundays: SundaySchedule[];
  updatedAt: string;
};

function toMonthDate(month: MonthKey) {
  return `${month}-01`;
}

export async function findPlan(wardId: string, month: MonthKey) {
  const rows = await sql`
    SELECT id, sundays, updated_at AS "updatedAt"
    FROM meeting_plans
    WHERE ward_id = ${wardId} AND month = ${toMonthDate(month)}
  `;

  return (rows[0] as StoredPlan | undefined) ?? null;
}

type SavePlanInput = {
  wardId: string;
  userId: string;
  month: MonthKey;
  sundays: SundaySchedule[];
  personNames: string[];
};

/**
 * Grava o planejamento e cadastra os nomes novos na mesma transação:
 * se um falhar, nenhum dos dois é salvo.
 */
export async function savePlanWithPeople({
  wardId,
  userId,
  month,
  sundays,
  personNames,
}: SavePlanInput) {
  const [planRows, addedPeople] = await sql.transaction([
    sql`
      INSERT INTO meeting_plans (ward_id, month, sundays, created_by)
      VALUES (${wardId}, ${toMonthDate(month)}, ${JSON.stringify(sundays)}, ${userId})
      ON CONFLICT (ward_id, month)
      DO UPDATE SET sundays = EXCLUDED.sundays, updated_at = now()
      RETURNING id, updated_at AS "updatedAt"
    `,
    sql`
      INSERT INTO ward_people (ward_id, name)
      SELECT ${wardId}, unnest(${personNames}::text[])
      ON CONFLICT (ward_id, lower(name)) DO NOTHING
      RETURNING id, name
    `,
  ]);

  return {
    plan: planRows[0] as { id: string; updatedAt: string },
    addedPeople: addedPeople as Person[],
  };
}
