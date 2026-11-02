"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import styles from "@/components/meeting/meeting.module.css";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const result = await authClient.signUp.email({ name, email, password });

      if (result.error) {
        setError("Não foi possível criar a conta. Verifique os dados informados.");
        setPending(false);
        return;
      }

      const session = await authClient.getSession();

      if (!session.data?.user) {
        const signInResult = await authClient.signIn.email({ email, password });

        if (signInResult.error) {
          setError(
            "A conta foi criada, mas não foi possível iniciar a sessão. Entre pela tela de login.",
          );
          setPending(false);
          return;
        }
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Não foi possível conectar à autenticação. Tente novamente.");
      setPending(false);
    }
  }

  return (
    <main className={styles.authShell}>
      <form className={styles.authCard} onSubmit={submit}>
        <p className={`${styles.eyebrow} ${styles.accent}`}>Atas+</p>
        <h1>Criar conta da ala</h1>
        <label>
          Seu nome
          <input required value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          E-mail
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Senha
          <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error && <p className={styles.formError}>{error}</p>}
        <button className={styles.primaryButton} disabled={pending}>
          {pending ? "Criando..." : "Criar conta"}
        </button>
        <p className={styles.authHelp}>
          Já possui uma conta? <Link href="/auth/sign-in">Entrar</Link>
        </p>
      </form>
    </main>
  );
}
