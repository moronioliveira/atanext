"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import styles from "@/components/meeting/meeting.module.css";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const result = await authClient.signIn.email({ email, password });

    if (result.error) {
      setError("Não foi possível entrar. Verifique o e-mail e a senha.");
      setPending(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className={styles.authShell}>
      <form className={styles.authCard} onSubmit={submit}>
        <p className={`${styles.eyebrow} ${styles.accent}`}>Atas+</p>
        <h1>Entrar na sua ala</h1>
        <label>
          E-mail
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Senha
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <p className={styles.formError}>{error}</p>}
        <button className={styles.primaryButton} disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </button>
        <p className={styles.authHelp}>
          Ainda não tem acesso? <Link href="/auth/sign-up">Criar conta da ala</Link>
        </p>
      </form>
    </main>
  );
}
