"use client";

import { useId, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { TextField } from "@/components/ui/TextField";
import { filterByName } from "@/lib/text";
import type { ActionResult, Person } from "@/types/people";
import styles from "./People.module.css";
import { PersonRow } from "./PersonRow";

type PeopleListProps = {
  people: Person[];
  onRename: (id: string, name: string) => Promise<ActionResult>;
  onRemove: (id: string) => Promise<ActionResult>;
};

/** Lista de membros salvos. Fica recolhida até o usuário abrir. */
export function PeopleList({ people, onRename, onRemove }: PeopleListProps) {
  const contentId = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const visiblePeople = useMemo(() => filterByName(people, search), [people, search]);

  async function confirmDelete() {
    if (!personToDelete) {
      return;
    }

    setDeleting(true);
    setDeleteError("");

    const result = await onRemove(personToDelete.id);

    setDeleting(false);

    if (result.error) {
      setDeleteError(result.error);
      return;
    }

    setPersonToDelete(null);
  }

  return (
    <div className={styles.listSection}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={styles.toggleLabel}>
          <Icon name="users" size={18} />
          {open ? "Ocultar" : "Ver"} membros salvos
          <span className={styles.count}>{people.length}</span>
        </span>
        <Icon name="chevronDown" size={18} className={styles.chevron} />
      </button>

      {open && (
        <div className={styles.listContent} id={contentId}>
          <TextField
            label="Buscar membro na lista"
            hideLabel
            type="search"
            placeholder="Buscar pelo nome"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {visiblePeople.length === 0 ? (
            <p className={styles.empty}>Nenhum membro encontrado para essa busca.</p>
          ) : (
            <ul className={styles.rows} aria-label="Membros salvos">
              {visiblePeople.map((person) => (
                <PersonRow
                  key={person.id}
                  person={person}
                  onRename={onRename}
                  onRequestDelete={setPersonToDelete}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <ConfirmDialog
        open={personToDelete !== null}
        title="Excluir membro?"
        description={`${personToDelete?.name ?? ""} sairá da lista e das sugestões. Atas e planejamentos já salvos não mudam.`}
        confirmLabel="Excluir membro"
        pending={deleting}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          setPersonToDelete(null);
          setDeleteError("");
        }}
      />
    </div>
  );
}
