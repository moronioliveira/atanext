"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { authClient } from "@/lib/auth/client";
import { AUTH_CONNECTION_ERROR, PASSWORD_MIN_LENGTH, SIGN_IN_ERROR } from "../errors";
import styles from "./AuthForm.module.css";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const result = await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(SIGN_IN_ERROR);
        setPending(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError(AUTH_CONNECTION_ERROR);
      setPending(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Acesso"
      title="Entrar na sua ala"
      description="Use o e-mail e a senha definidos no cadastro. Recebeu um convite e ainda não tem conta? Crie a conta primeiro."
      footer={
        <>
          Ainda não tem conta? <Link href="/auth/sign-up">Criar conta</Link>
        </>
      }
    >
      <form className={styles.form} onSubmit={submit}>
        <TextField
          label="E-mail"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="Senha"
          type="password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" fullWidth loading={pending}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  );
}
