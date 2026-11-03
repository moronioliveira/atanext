"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "@/components/meeting/meeting.module.css";

export function WardAccessPanel() {
  const [isLeader, setIsLeader] = useState(false);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [invitations, setInvitations] = useState<
    Array<{
      id: string;
      email: string;
      status: string;
      memberStatus?: string;
      memberRole?: string;
    }>
  >([]);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    async function loadAccess() {
      const response = await fetch("/api/invitations");
      if (!response.ok) {
        return;
      }
      const body = await response.json();
      setIsLeader(body.role === "leader");
      setInvitations(body.invitations ?? []);
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
    setInvitations((current) => [...current, { id: "", email, status: "pending" }]);

    const response = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setPending(false);
    setNotice(response.ok ? "Convite registrado." : "Não foi possível registrar o convite.");
    if (response.ok) {
      setInvitations((current) =>
        current.map((invitation) =>
          invitation.email === email
            ? { ...invitation, status: "accepted" }
            : invitation,
        ),
      );
      const signUpUrl = new URL("/auth/sign-up", window.location.origin);
      signUpUrl.searchParams.set("email", email.trim().toLowerCase());
      setInviteLink(signUpUrl.toString());
      setEmail("");
    }
  }

  async function revokeMember(invitationId: string) {
    if (!window.confirm("Deseja realmente desvincular esta pessoa da ala?")) {
      return;
    }

    setPending(true);
    const response = await fetch("/api/invitations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationId }),
    });

    if (response.ok) {
      setInvitations((current) =>
        current.map((invitation) =>
          invitation.id === invitationId
            ? { ...invitation, status: "rejected", memberStatus: "revoked" }
            : invitation,
        ),
      );
      setNotice("Acesso desvinculado.");
    } else {
      const body = await response.json().catch(() => null);
      setNotice(body?.error ?? "Não foi possível desvincular o acesso.");
    }
    setPending(false);
  }

  async function deleteMemberRecord(invitationId: string) {
    if (!window.confirm("Deseja excluir definitivamente este registro da ala?")) {
      return;
    }

    setPending(true);
    const response = await fetch("/api/invitations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationId, action: "delete" }),
    });

    if (response.ok) {
      setInvitations((current) =>
        current.filter((invitation) => invitation.id !== invitationId),
      );
      setNotice("Registro excluído da ala.");
    } else {
      const body = await response.json().catch(() => null);
      setNotice(body?.error ?? "Não foi possível excluir o registro.");
    }
    setPending(false);
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
      {invitations.length > 0 && (
        <div className={styles.memberList}>
          <h4>Pessoas convidadas</h4>
          {invitations.map((invitation) => (
            <div className={styles.memberRow} key={invitation.id}>
              <span>
                <strong>{invitation.email}</strong>
                <small>
                  {invitation.status === "pending"
                    ? "Convite pendente"
                    : invitation.memberStatus === "active"
                      ? "Ativo na ala"
                      : "Desvinculado"}
                </small>
              </span>
              {invitation.status === "accepted" &&
                invitation.memberStatus === "active" && (
                  <button
                    type="button"
                    className={styles.dangerButton}
                    disabled={pending}
                    onClick={() => void revokeMember(invitation.id)}
                  >
                    Desvincular
                  </button>
                )}
              {invitation.status === "rejected" &&
                invitation.memberStatus === "revoked" && (
                  <button
                    type="button"
                    className={styles.dangerButton}
                    disabled={pending}
                    onClick={() => void deleteMemberRecord(invitation.id)}
                  >
                    Excluir registro
                  </button>
                )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
