"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { requestJson } from "@/lib/api/client";
import { authClient } from "@/lib/auth/client";

/** Ações da conta: sair da ala, excluir a ala (líder) e encerrar a sessão. */
export function useWardAccountActions() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function runWardDeletion(body: Record<string, string>, fallbackError: string) {
    setPending(true);
    setError("");

    const result = await requestJson("/api/wards", { method: "DELETE", body, fallbackError });

    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push("/onboarding");
  }

  function leaveWard() {
    return runWardDeletion({ action: "leave" }, "Não foi possível sair da ala.");
  }

  function deleteWard(confirmation: string) {
    return runWardDeletion({ action: "delete", confirmation }, "Não foi possível excluir a ala.");
  }

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.push("/auth/sign-in");
  }

  function clearError() {
    setError("");
  }

  return { pending, error, clearError, leaveWard, deleteWard, signOut };
}
