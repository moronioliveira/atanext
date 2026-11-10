"use client";

import { useId, useMemo, useState } from "react";
import { filterPeopleByName } from "@/lib/people";
import type { Person, PersonActionResult } from "@/types/people";
import styles from "./PeopleList.module.css";
import { PersonRow } from "./PersonRow";

type PeopleListProps = {
  people: Person[];
  onRename: (id: string, name: string) => Promise<PersonActionResult>;
  onRemove: (id: string) => Promise<PersonActionResult>;
};

export function PeopleList({ people, onRename, onRemove }: PeopleListProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const contentId = useId();

  const visiblePeople = useMemo(
    () => filterPeopleByName(people, search),
    [people, search],
  );

  return (
    <div className={styles.list}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>
          {open ? "Ocultar" : "Ver"} membros salvos ({people.length})
        </span>
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className={styles.content} id={contentId}>
          <label className={styles.search}>
            <span className={styles.visuallyHidden}>
              Buscar membro na lista
            </span>
            <input
              type="search"
              placeholder="Buscar na lista"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          {visiblePeople.length === 0 ? (
            <p className={styles.empty}>
              Nenhum membro encontrado para essa busca.
            </p>
          ) : (
            <ul className={styles.rows}>
              {visiblePeople.map((person) => (
                <PersonRow
                  key={person.id}
                  person={person}
                  onRename={onRename}
                  onRemove={onRemove}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
