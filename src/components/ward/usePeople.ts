"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Person, PersonActionResult } from "@/types/people";

function sortByName(people: Person[]) {
  return [...people].sort((first, second) =>
    first.name.localeCompare(second.name, "pt-BR"),
  );
}

async function readError(response: Response, fallback: string) {
  try {
    const body = await response.json();

    return typeof body.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Mantém a lista de membros da ala atual e as ações de cadastrar,
 * renomear e excluir. Todas as operações passam pela API da ala.
 */
export function usePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPeople() {
      const response = await fetch("/api/people");

      if (!active) {
        return;
      }

      if (!response.ok) {
        setLoadError("Não foi possível carregar os membros da ala.");
        setLoading(false);
        return;
      }

      const body = await response.json();
      const loadedPeople = Array.isArray(body.people) ? body.people : [];

      if (active) {
        setPeople(sortByName(loadedPeople));
        setLoading(false);
      }
    }

    void loadPeople();

    return () => {
      active = false;
    };
  }, []);

  const names = useMemo(
    () => people.map((person) => person.name),
    [people],
  );

  const mergePeople = useCallback((addedPeople: Person[]) => {
    if (addedPeople.length === 0) {
      return;
    }

    setPeople((current) => sortByName([...current, ...addedPeople]));
  }, []);

  const addPerson = useCallback(
    async (name: string): Promise<PersonActionResult> => {
      const response = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        return {
          error: await readError(response, "Não foi possível cadastrar o membro."),
        };
      }

      const body = await response.json();

      mergePeople([body.person]);

      return { error: null };
    },
    [mergePeople],
  );

  const renamePerson = useCallback(
    async (id: string, name: string): Promise<PersonActionResult> => {
      const response = await fetch(`/api/people/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        return {
          error: await readError(response, "Não foi possível renomear o membro."),
        };
      }

      const body = await response.json();

      setPeople((current) =>
        sortByName(
          current.map((person) => (person.id === id ? body.person : person)),
        ),
      );

      return { error: null };
    },
    [],
  );

  const removePerson = useCallback(
    async (id: string): Promise<PersonActionResult> => {
      const response = await fetch(`/api/people/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        return {
          error: await readError(response, "Não foi possível excluir o membro."),
        };
      }

      setPeople((current) => current.filter((person) => person.id !== id));

      return { error: null };
    },
    [],
  );

  return {
    people,
    names,
    loading,
    loadError,
    mergePeople,
    addPerson,
    renamePerson,
    removePerson,
  };
}

export type PeopleStore = ReturnType<typeof usePeople>;
