"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { PERSON_NAME_MAX_LENGTH, PERSON_NAME_MIN_LENGTH } from "@/lib/people";
import type { ActionResult, Person } from "@/types/people";
import styles from "./People.module.css";

type PersonRowProps = {
  person: Person;
  onRename: (id: string, name: string) => Promise<ActionResult>;
  onRequestDelete: (person: Person) => void;
};

/** Linha da lista de membros, com edição do nome no próprio lugar. */
export function PersonRow({ person, onRename, onRequestDelete }: PersonRowProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(person.name);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function startEditing() {
    setDraftName(person.name);
    setError("");
    setEditing(true);
  }

  function cancelEditing() {
    setError("");
    setEditing(false);
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

    setEditing(false);
  }

  if (editing) {
    return (
      <li className={styles.row}>
        <form
          className={styles.editForm}
          onSubmit={saveName}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              cancelEditing();
            }
          }}
        >
          <TextField
            label={`Novo nome de ${person.name}`}
            hideLabel
            autoFocus
            required
            minLength={PERSON_NAME_MIN_LENGTH}
            maxLength={PERSON_NAME_MAX_LENGTH}
            value={draftName}
            error={error || undefined}
            onChange={(event) => setDraftName(event.target.value)}
          />
          <div className={styles.rowActions}>
            <Button type="submit" size="sm" loading={pending}>
              Salvar
            </Button>
            <Button size="sm" variant="ghost" disabled={pending} onClick={cancelEditing}>
              Cancelar
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={styles.row}>
      <span className={styles.personName}>{person.name}</span>
      <div className={styles.rowActions}>
        <Button
          size="sm"
          variant="ghost"
          icon="edit"
          aria-label={`Editar ${person.name}`}
          onClick={startEditing}
        >
          Editar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon="trash"
          className={styles.deleteButton}
          aria-label={`Excluir ${person.name}`}
          onClick={() => onRequestDelete(person)}
        >
          Excluir
        </Button>
      </div>
    </li>
  );
}
