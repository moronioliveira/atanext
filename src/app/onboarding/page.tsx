"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import styles from "@/components/meeting/meeting.module.css";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [invitationId, setInvitationId] = useState("");

  useEffect(() => {
    async function checkSession() {
      const session = await authClient.getSession();

      if (!session.data?.user) {
        router.replace("/auth/sign-in");
        return false;
      }

      return true;
    }

    async function loadInvitation() {
      if (!(await checkSession())) {
        return;
      }

      const response = await fetch("/api/invitations");
      if (!response.ok) {
        return;
      }
      const body = await response.json();
      setInvitationId(body.invitations?.[0]?.id ?? "");
    }

    void loadInvitation();
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/wards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.status === 401) {
        setError("Sua sessão não está ativa. Entre novamente para criar a ala.");
        setPending(false);
        router.replace("/auth/sign-in");
        return;
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Não foi possível criar a ala. Tente novamente.");
        setPending(false);
        return;
      }

      router.push("/");
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
      setPending(false);
    }
  }

  async function acceptInvitation() {
    setPending(true);
    setError("");
    const response = await fetch("/api/invitations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationId }),
    });

    if (!response.ok) {
      setError("Não foi possível aceitar o convite.");
      setPending(false);
      return;
    }

    router.push("/");
  }

  return (
    <main className={styles.authShell}>
      <form className={styles.authCard} onSubmit={submit}>
        <p className={`${styles.eyebrow} ${styles.accent}`}>Primeiro acesso</p>
        <h1>{invitationId ? "Aceitar convite" : "Cadastre sua ala"}</h1>
        {invitationId ? (
          <p className={styles.muted}>
            Você foi convidado para administrar uma ala. Aceite o convite para
            acessar os planejamentos.
          </p>
        ) : (
          <>
            <p className={styles.muted}>
              Você será o líder e poderá convidar os demais administradores.
            </p>
            <label>
              Nome da ala
              <input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          </>
        )}
        {error && <p className={styles.formError}>{error}</p>}
        {invitationId ? (
          <button type="button" className={styles.primaryButton} disabled={pending} onClick={() => void acceptInvitation()}>
            {pending ? "Aceitando..." : "Aceitar convite"}
          </button>
        ) : (
          <button className={styles.primaryButton} disabled={pending}>
            {pending ? "Salvando..." : "Criar ala"}
          </button>
        )}
      </form>
    </main>
  );
}
