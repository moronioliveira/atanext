"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { authClient } from "@/lib/auth/client";
import { normalizeEmail } from "@/lib/ward";
import { AUTH_CONNECTION_ERROR, getSignUpErrorMessage, PASSWORD_MIN_LENGTH } from "../errors";
import styles from "./AuthForm.module.css";

/** Garante a sessão logo após o cadastro (alguns provedores não logam automaticamente). */
async function ensureSession(email: string, password: string) {
  const session = await authClient.getSession();

  if (session.data?.user) {
    return true;
  }

  const signInResult = await authClient.signIn.email({ email, password });

  return !signInResult.error;
}

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitedEmail = normalizeEmail(searchParams.get("email") ?? "");
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

      if (!(await ensureSession(email, password))) {
        setError(
          "A conta foi criada, mas não foi possível iniciar a sessão. Entre pela tela de login.",
        );
        setPending(false);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError(AUTH_CONNECTION_ERROR);
      setPending(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Cadastro"
      title="Criar sua conta"
      description={
        invitedEmail
          ? "Você foi convidado para uma ala. Defina seu nome e sua senha para começar."
          : "Crie sua conta para cadastrar a ala ou aceitar um convite recebido."
      }
      footer={
        <>
          Já possui uma conta? <Link href="/auth/sign-in">Entrar</Link>
        </>
      }
    >
      <form className={styles.form} onSubmit={submit}>
        <TextField
          label="Seu nome"
          required
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          label="E-mail"
          type="email"
          required
          autoComplete="email"
          hint={invitedEmail ? "Use o mesmo e-mail que recebeu o convite." : undefined}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="Senha"
          type="password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          hint={`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres.`}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" fullWidth loading={pending}>
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  );
}
