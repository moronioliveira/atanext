"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import styles from "@/components/meeting/meeting.module.css";

function getSignUpErrorMessage(error: { status?: number; code?: string }) {
  if (
    error.status === 422 ||
    error.code === "USER_ALREADY_EXISTS" ||
    error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
  ) {
    return "Este e-mail já está cadastrado. Entre pela tela de login.";
  }

  if (error.status === 400 || error.code === "VALIDATION_ERROR") {
    return "Confira seu nome, e-mail e senha e tente novamente.";
  }

  return "Não foi possível criar a conta. Verifique os dados informados.";
}

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitedEmail = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState(invitedEmail);
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
        setError(getSignUpErrorMessage(result.error));
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
        <h1>Criar sua conta</h1>
        <p className={styles.muted}>
          Crie sua senha para acessar a ala. Se você recebeu um convite, use o
          mesmo e-mail indicado nele.
        </p>
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

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
