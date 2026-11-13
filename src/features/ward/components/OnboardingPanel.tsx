"use client";

import { useState, type FormEvent } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TextField } from "@/components/ui/TextField";
import { WARD_NAME_MAX_LENGTH, WARD_NAME_MIN_LENGTH } from "@/lib/ward";
import { useOnboarding } from "../hooks/useOnboarding";
import styles from "./OnboardingPanel.module.css";

/** Primeiro acesso: aceitar o convite recebido ou cadastrar uma nova ala. */
export function OnboardingPanel() {
  const { checking, invitationId, pending, error, createWard, acceptInvitation } = useOnboarding();
  const [wardName, setWardName] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void createWard(wardName);
  }

  if (checking) {
    return (
      <AuthLayout
        eyebrow="Primeiro acesso"
        title="Preparando seu acesso"
        description="Só um instante."
      >
        <div className={styles.loading}>
          <Spinner label="Verificando convites" />
        </div>
      </AuthLayout>
    );
  }

  if (invitationId) {
    return (
      <AuthLayout
        eyebrow="Primeiro acesso"
        title="Você recebeu um convite"
        description="Aceite o convite para ajudar a administrar os planejamentos da ala."
      >
        <div className={styles.form}>
          {error && <Alert tone="error">{error}</Alert>}
          <Button fullWidth icon="check" loading={pending} onClick={() => void acceptInvitation()}>
            Aceitar convite
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Primeiro acesso"
      title="Cadastre sua ala"
      description="Você será o líder da ala e poderá convidar os demais administradores."
    >
      <form className={styles.form} onSubmit={submit}>
        <TextField
          label="Nome da ala"
          required
          minLength={WARD_NAME_MIN_LENGTH}
          maxLength={WARD_NAME_MAX_LENGTH}
          placeholder="Ex.: Ala Centro"
          value={wardName}
          onChange={(event) => setWardName(event.target.value)}
        />
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" fullWidth loading={pending}>
          Criar ala
        </Button>
      </form>
    </AuthLayout>
  );
}
