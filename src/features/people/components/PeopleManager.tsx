"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { TextField } from "@/components/ui/TextField";
import { PERSON_NAME_MAX_LENGTH, PERSON_NAME_MIN_LENGTH } from "@/lib/people";
import { usePeople } from "../hooks/usePeople";
import styles from "./People.module.css";
import { PeopleList } from "./PeopleList";

type Notice = {
  tone: "success" | "error";
  text: string;
};

/** Cadastro reutilizável de membros da ala (usado no autocomplete do planejamento). */
export function PeopleManager() {
  const store = usePeople();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotice(null);

    const result = await store.addPerson(name);

    setPending(false);

    if (result.error) {
      setNotice({ tone: "error", text: result.error });
      return;
    }

    setNotice({ tone: "success", text: `${name.trim()} foi adicionado à lista.` });
    setName("");
  }

  return (
    <Card>
      <CardHeader
        eyebrow="Cadastro da ala"
        title="Membros reutilizáveis"
        description="Os nomes aparecem como sugestão nas designações. Nomes digitados no planejamento também entram aqui automaticamente ao salvar."
      />

      <form className={styles.addForm} onSubmit={submit}>
        <TextField
          label="Nome completo"
          required
          minLength={PERSON_NAME_MIN_LENGTH}
          maxLength={PERSON_NAME_MAX_LENGTH}
          autoComplete="off"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit" icon="plus" loading={pending}>
          Adicionar
        </Button>
      </form>

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

      {store.loading && <Spinner label="Carregando membros" />}
      {store.loadError && <Alert tone="error">{store.loadError}</Alert>}
      {!store.loading && !store.loadError && store.people.length === 0 && (
        <p className={styles.empty}>Nenhum membro salvo ainda.</p>
      )}
      {store.people.length > 0 && (
        <PeopleList
          people={store.people}
          onRename={store.renamePerson}
          onRemove={store.removePerson}
        />
      )}
    </Card>
  );
}
