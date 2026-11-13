"use client";

import { useCallback, useEffect, useState } from "react";
import { requestJson } from "@/lib/api/client";
import type { WardMembership } from "@/types/ward";

export type CurrentWardState =
  | { status: "loading" }
  | { status: "ready"; ward: WardMembership }
  | { status: "signedOut" }
  | { status: "withoutWard" }
  | { status: "error"; message: string };

/** Carrega a ala do usuário logado e informa se ele precisa entrar ou criar uma ala. */
export function useCurrentWard() {
  const [state, setState] = useState<CurrentWardState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadWard() {
      const result = await requestJson<{ ward: WardMembership }>("/api/wards", {
        fallbackError: "Não foi possível carregar os dados da ala.",
      });

      if (!active) {
        return;
      }

      if (result.ok) {
        setState({ status: "ready", ward: result.data.ward });
      } else if (result.status === 401) {
        setState({ status: "signedOut" });
      } else if (result.status === 404) {
        setState({ status: "withoutWard" });
      } else {
        setState({ status: "error", message: result.error });
      }
    }

    void loadWard();

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }, []);

  return { state, retry };
}
