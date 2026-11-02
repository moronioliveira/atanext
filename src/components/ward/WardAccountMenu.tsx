"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import styles from "@/components/meeting/meeting.module.css";

type WardAccountMenuProps = {
  wardName: string;
  role: "leader" | "administrator";
};

export function WardAccountMenu({ wardName, role }: WardAccountMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    await authClient.signOut();
    router.push("/auth/sign-in");
  }

  async function leaveWard() {
    if (!window.confirm("Deseja realmente sair desta ala?")) {
      return;
    }

    setPending(true);
    setError("");
    const response = await fetch("/api/wards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "leave" }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "Não foi possível sair da ala.");
      setPending(false);
      return;
    }

    router.push("/onboarding");
  }

  async function deleteWard() {
    const confirmation = window.prompt(
      `Para excluir, digite o nome exato da ala: ${wardName}`,
    );

    if (confirmation === null) {
      return;
    }

    setPending(true);
    setError("");
    const response = await fetch("/api/wards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", confirmation }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error ?? "Não foi possível excluir a ala.");
      setPending(false);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <div className={styles.accountMenu}>
      <button
        className={styles.wardIdentity}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={styles.statusDot}>
          <strong>{wardName}</strong>
          <small>{role === "leader" ? "Líder" : "Administrador"}</small>
        </span>
        <span aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className={styles.accountPopover}>
          {error && <p className={styles.formError}>{error}</p>}
          {role === "administrator" && (
            <button disabled={pending} onClick={() => void leaveWard()}>
              {pending ? "Aguarde..." : "Sair da ala"}
            </button>
          )}
          {role === "leader" && (
            <button disabled={pending} onClick={() => void deleteWard()}>
              {pending ? "Excluindo..." : "Excluir ala"}
            </button>
          )}
          <button disabled={pending} onClick={() => void signOut()}>
            Sair da conta
          </button>
        </div>
      )}
    </div>
  );
}
