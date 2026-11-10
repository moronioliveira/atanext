"use client";

import { useState, type FormEvent } from "react";
import sharedStyles from "@/components/meeting/meeting.module.css";
import {
  PERSON_NAME_MAX_LENGTH,
  PERSON_NAME_MIN_LENGTH,
} from "@/lib/people";
import type { Person, PersonActionResult } from "@/types/people";
import styles from "./PeopleList.module.css";

type PersonRowProps = {
  person: Person;
  onRename: (id: string, name: string) => Promise<PersonActionResult>;
  onRemove: (id: string) => Promise<PersonActionResult>;
};

type RowMode = "view" | "edit" | "confirmDelete";

export function PersonRow({ person, onRename, onRemove }: PersonRowProps) {
  const [mode, setMode] = useState<RowMode>("view");
  const [draftName, setDraftName] = useState(person.name);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function startEditing() {
    setDraftName(person.name);
    setError("");
    setMode("edit");
  }

  function cancel() {
    setError("");
    setMode("view");
  }

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const result = await onRename(person.id, draftName);

    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setMode("view");
  }

  async function confirmDelete() {
    setPending(true);

    const result = await onRemove(person.id);

    // Em caso de sucesso a linha é removida da lista e desmontada.
    if (result.error) {
      setPending(false);
      setError(result.error);
    }
  }

  if (mode === "edit") {
    return (
      <li className={styles.row}>
        <form className={styles.editForm} onSubmit={saveName}>
          <label className={styles.visuallyHidden} htmlFor={`person-${person.id}`}>
            Novo nome de {person.name}
          </label>
          <input
            id={`person-${person.id}`}
            autoFocus
            required
            minLength={PERSON_NAME_MIN_LENGTH}
            maxLength={PERSON_NAME_MAX_LENGTH}
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                cancel();
              }
            }}
          />
          <div className={styles.actions}>
            <button className={sharedStyles.secondaryButton} disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className={sharedStyles.textButton}
              disabled={pending}
              onClick={cancel}
            >
              Cancelar
            </button>
          </div>
        </form>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </li>
    );
  }

  if (mode === "confirmDelete") {
    return (
      <li className={styles.row}>
        <div className={styles.viewRow}>
          <span>
            Excluir <strong>{person.name}</strong> da lista?
          </span>
          <div className={styles.actions}>
            <button
              type="button"
              className={sharedStyles.dangerButton}
              disabled={pending}
              onClick={() => void confirmDelete()}
            >
              {pending ? "Excluindo..." : "Confirmar exclusão"}
            </button>
            <button
              type="button"
              className={sharedStyles.textButton}
              disabled={pending}
              onClick={cancel}
            >
              Cancelar
            </button>
          </div>
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </li>
    );
  }

  return (
    <li className={styles.row}>
      <div className={styles.viewRow}>
        <span className={styles.name}>{person.name}</span>
        <div className={styles.actions}>
          <button
            type="button"
            className={sharedStyles.textButton}
            aria-label={`Editar ${person.name}`}
            onClick={startEditing}
          >
            Editar
          </button>
          <button
            type="button"
            className={sharedStyles.dangerButton}
            aria-label={`Excluir ${person.name}`}
            onClick={() => setMode("confirmDelete")}
          >
            Excluir
          </button>
        </div>
      </div>
    </li>
  );
}
