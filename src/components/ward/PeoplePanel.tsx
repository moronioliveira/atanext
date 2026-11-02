"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "@/components/meeting/meeting.module.css";

type Person = {
  id: string;
  name: string;
};

type PeoplePanelProps = {
  onPeopleChange: (people: string[]) => void;
};

export function PeoplePanel({ onPeopleChange }: PeoplePanelProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  const names = useMemo(() => people.map((person) => person.name), [people]);

  useEffect(() => {
    async function loadPeople() {
      const response = await fetch("/api/people");
      if (!response.ok) {
        return;
      }

      const body = await response.json();
      const loadedPeople = Array.isArray(body.people) ? body.people : [];
      setPeople(loadedPeople);
      onPeopleChange(loadedPeople.map((person: Person) => person.name));
    }

    void loadPeople();
  }, [onPeopleChange]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotice("");

    const response = await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const body = await response.json();
    setPending(false);

    if (!response.ok) {
      setNotice(body.error ?? "Não foi possível cadastrar o membro.");
      return;
    }

    const updatedPeople = [...people, body.person].sort((a: Person, b: Person) =>
      a.name.localeCompare(b.name, "pt-BR"),
    );
    setPeople(updatedPeople);
    onPeopleChange(updatedPeople.map((person) => person.name));
    setName("");
    setNotice("Membro cadastrado.");
  }

  return (
    <section className={styles.accessCard}>
      <div>
        <p className={`${styles.eyebrow} ${styles.accent}`}>Cadastro da ala</p>
        <h3>Membros reutilizáveis</h3>
      </div>
      <form className={styles.accessForm} onSubmit={submit}>
        <label>
          Nome completo
          <input
            required
            minLength={2}
            maxLength={160}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <button className={styles.secondaryButton} disabled={pending}>
          {pending ? "Cadastrando..." : "Cadastrar membro"}
        </button>
      </form>
      {names.length > 0 && (
        <p className={styles.muted}>{names.length} membro(s) disponível(is) no autocomplete.</p>
      )}
      {notice && <p className={styles.notice} role="status">{notice}</p>}
    </section>
  );
}
