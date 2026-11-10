"use client";

import { useState, type FormEvent } from "react";
import styles from "@/components/meeting/meeting.module.css";
import {
  PERSON_NAME_MAX_LENGTH,
  PERSON_NAME_MIN_LENGTH,
} from "@/lib/people";
import type { PeopleStore } from "./usePeople";
import { PeopleList } from "./PeopleList";

type PeoplePanelProps = {
  store: PeopleStore;
};

export function PeoplePanel({ store }: PeoplePanelProps) {
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotice("");

    const result = await store.addPerson(name);

    setPending(false);

    if (result.error) {
      setNotice(result.error);
      return;
    }

    setName("");
    setNotice("Membro cadastrado.");
  }

  return (
    <section className={styles.accessCard}>
      <div>
        <p className={`${styles.eyebrow} ${styles.accent}`}>Cadastro da ala</p>
        <h3>Membros reutilizáveis</h3>
        <p className={styles.muted}>
          Os nomes digitados nas designações do domingo também entram nesta
          lista ao salvar o planejamento.
        </p>
      </div>
      <form className={styles.accessForm} onSubmit={submit}>
        <label>
          Nome completo
          <input
            required
            minLength={PERSON_NAME_MIN_LENGTH}
            maxLength={PERSON_NAME_MAX_LENGTH}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <button className={styles.secondaryButton} disabled={pending}>
          {pending ? "Cadastrando..." : "Cadastrar membro"}
        </button>
      </form>
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      {store.loading && (
        <p className={styles.muted}>Carregando membros...</p>
      )}
      {store.loadError && (
        <p className={styles.notice} role="alert">
          {store.loadError}
        </p>
      )}
      {!store.loading && !store.loadError && store.people.length === 0 && (
        <p className={styles.muted}>Nenhum membro salvo ainda.</p>
      )}
      {store.people.length > 0 && (
        <PeopleList
          people={store.people}
          onRename={store.renamePerson}
          onRemove={store.removePerson}
        />
      )}
    </section>
  );
}
