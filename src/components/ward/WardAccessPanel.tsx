"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "@/components/meeting/meeting.module.css";

export function WardAccessPanel() {
  const [isLeader, setIsLeader] = useState(false);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    async function loadAccess() {
      const response = await fetch("/api/invitations");
      if (!response.ok) {
        return;
      }
      const body = await response.json();
      setIsLeader(body.role === "leader");
    }

    void loadAccess();
  }, []);

  if (!isLeader) {
    return null;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setNotice("");

    const response = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setPending(false);
    setNotice(response.ok ? "Convite registrado." : "Não foi possível registrar o convite.");
    if (response.ok) {
      const signUpUrl = new URL("/auth/sign-up", window.location.origin);
      signUpUrl.searchParams.set("email", email.trim().toLowerCase());
      setInviteLink(signUpUrl.toString());
      setEmail("");
    }
  }

  return (
    <section className={styles.accessCard}>
      <div>
        <p className={`${styles.eyebrow} ${styles.accent}`}>Acesso da ala</p>
        <h3>Adicionar administrador</h3>
      </div>
      <form className={styles.accessForm} onSubmit={submit}>
        <label>
          E-mail do administrador
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <button className={styles.secondaryButton} disabled={pending}>
          {pending ? "Registrando..." : "Registrar convite"}
        </button>
      </form>
      {notice && <p className={styles.notice}>{notice}</p>}
      {inviteLink && (
        <p className={styles.notice}>
          Envie este link para a pessoa convidada criar a conta e definir a
          própria senha:{" "}
          <a href={inviteLink}>{inviteLink}</a>
        </p>
      )}
    </section>
  );
}
