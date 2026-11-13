"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { requestJson } from "@/lib/api/client";
import { authClient } from "@/lib/auth/client";

type PendingInvitation = {
  id: string;
};

/**
 * Primeiro acesso: confere a sessão, procura um convite pendente para o
 * e-mail do usuário e permite aceitá-lo ou criar uma nova ala.
 */
export function useOnboarding() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [invitationId, setInvitationId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInvitation() {
      const session = await authClient.getSession();

      if (!session.data?.user) {
        router.replace("/auth/sign-in");
        return;
      }

      const result = await requestJson<{ invitations: PendingInvitation[] }>("/api/invitations", {
        fallbackError: "Não foi possível verificar convites.",
      });

      if (active) {
        setInvitationId(result.ok ? (result.data.invitations?.[0]?.id ?? "") : "");
        setChecking(false);
      }
    }

    void loadInvitation();

    return () => {
      active = false;
    };
  }, [router]);

  async function createWard(name: string) {
    setPending(true);
    setError("");

    const result = await requestJson("/api/wards", {
      method: "POST",
      body: { name },
      fallbackError: "Não foi possível criar a ala. Tente novamente.",
    });

    if (result.ok) {
      router.push("/");
      return;
    }

    if (result.status === 401) {
      router.replace("/auth/sign-in");
    }

    setError(
      result.status === 401
        ? "Sua sessão não está ativa. Entre novamente para criar a ala."
        : result.error,
    );
    setPending(false);
  }

  async function acceptInvitation() {
    setPending(true);
    setError("");

    const result = await requestJson("/api/invitations", {
      method: "PATCH",
      body: { invitationId },
      fallbackError: "Não foi possível aceitar o convite.",
    });

    if (result.ok) {
      router.push("/");
      return;
    }

    setError(result.error);
    setPending(false);
  }

  return { checking, invitationId, pending, error, createWard, acceptInvitation };
}
