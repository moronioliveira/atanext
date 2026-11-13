"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { requestJson } from "@/lib/api/client";
import { sortPeopleByName } from "@/lib/people";
import type { ActionResult, Person } from "@/types/people";

/**
 * Lista de membros da ala atual com as ações de cadastrar, renomear e
 * excluir. Todas as operações passam pela API da ala.
 */
export function usePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    void requestJson<{ people: Person[] }>("/api/people", {
      fallbackError: "Não foi possível carregar os membros da ala.",
    }).then((result) => {
      if (!active) {
        return;
      }

      if (result.ok) {
        setPeople(sortPeopleByName(result.data.people ?? []));
      } else {
        setLoadError(result.error);
      }

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const names = useMemo(() => people.map((person) => person.name), [people]);

  /** Acrescenta membros recém-cadastrados (por exemplo, ao salvar o planejamento). */
  const mergePeople = useCallback((addedPeople: Person[]) => {
    if (addedPeople.length > 0) {
      setPeople((current) => sortPeopleByName([...current, ...addedPeople]));
    }
  }, []);

  const addPerson = useCallback(
    async (name: string): Promise<ActionResult> => {
      const result = await requestJson<{ person: Person }>("/api/people", {
        method: "POST",
        body: { name },
        fallbackError: "Não foi possível cadastrar o membro.",
      });

      if (!result.ok) {
        return { error: result.error };
      }

      mergePeople([result.data.person]);

      return { error: null };
    },
    [mergePeople],
  );

  const renamePerson = useCallback(async (id: string, name: string): Promise<ActionResult> => {
    const result = await requestJson<{ person: Person }>(`/api/people/${id}`, {
      method: "PATCH",
      body: { name },
      fallbackError: "Não foi possível renomear o membro.",
    });

    if (!result.ok) {
      return { error: result.error };
    }

    setPeople((current) =>
      sortPeopleByName(current.map((person) => (person.id === id ? result.data.person : person))),
    );

    return { error: null };
  }, []);

  const removePerson = useCallback(async (id: string): Promise<ActionResult> => {
    const result = await requestJson(`/api/people/${id}`, {
      method: "DELETE",
      fallbackError: "Não foi possível excluir o membro.",
    });

    if (!result.ok) {
      return { error: result.error };
    }

    setPeople((current) => current.filter((person) => person.id !== id));

    return { error: null };
  }, []);

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
