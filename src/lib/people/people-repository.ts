import { sql } from "@/lib/database";
import type { Person } from "@/types/people";

/** Somente servidor: membros reutilizáveis de uma ala. Toda query filtra pela ala. */

export async function listPeople(wardId: string) {
  const rows = await sql`
    SELECT id, name
    FROM ward_people
    WHERE ward_id = ${wardId}
    ORDER BY lower(name)
  `;

  return rows as Person[];
}

/** Cadastra um membro; devolve `null` se o nome já existir na ala. */
export async function insertPerson(wardId: string, name: string) {
  const rows = await sql`
    INSERT INTO ward_people (ward_id, name)
    VALUES (${wardId}, ${name})
    ON CONFLICT (ward_id, lower(name)) DO NOTHING
    RETURNING id, name
  `;

  return (rows[0] as Person | undefined) ?? null;
}

/** Renomeia um membro da ala; devolve `null` se ele não existir. */
export async function renamePerson(wardId: string, id: string, name: string) {
  const rows = await sql`
    UPDATE ward_people
    SET name = ${name}
    WHERE id = ${id} AND ward_id = ${wardId}
    RETURNING id, name
  `;

  return (rows[0] as Person | undefined) ?? null;
}

/** Exclui um membro da ala; devolve `false` se ele não existir. */
export async function deletePerson(wardId: string, id: string) {
  const rows = await sql`
    DELETE FROM ward_people
    WHERE id = ${id} AND ward_id = ${wardId}
    RETURNING id
  `;

  return rows.length > 0;
}
