"use client";

import { useCallback, useEffect, useState } from "react";
import { requestJson } from "@/lib/api/client";
import { buildInviteLink } from "@/lib/ward";
import type { ActionResult } from "@/types/people";
import type { WardInvitation } from "@/types/ward";

type InvitationsResponse = {
  invitations: WardInvitation[];
};

function fetchInvitations() {
  return requestJson<InvitationsResponse>("/api/invitations", {
    fallbackError: "Não foi possível carregar os convites.",
  });
}

/** Convites de administradores da ala (somente o líder usa). */
export function useInvitations() {
  const [invitations, setInvitations] = useState<WardInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const applyResult = useCallback((result: Awaited<ReturnType<typeof fetchInvitations>>) => {
    if (result.ok) {
      setInvitations(result.data.invitations ?? []);
      setLoadError("");
    } else {
      setLoadError(result.error);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    void fetchInvitations().then((result) => {
      if (active) {
        applyResult(result);
      }
    });

    return () => {
      active = false;
    };
  }, [applyResult]);

  async function reload() {
    applyResult(await fetchInvitations());
  }

  /** Registra o convite e devolve o link de cadastro para enviar à pessoa. */
  async function invite(email: string): Promise<ActionResult & { link?: string }> {
    const result = await requestJson("/api/invitations", {
      method: "POST",
      body: { email },
      fallbackError: "Não foi possível registrar o convite.",
    });

    if (!result.ok) {
      return { error: result.error };
    }

    await reload();

    return { error: null, link: buildInviteLink(window.location.origin, email) };
  }

  /** Desvincula um administrador ou exclui um registro já desvinculado. */
  async function removeAccess(
    invitationId: string,
    action: "revoke" | "delete",
  ): Promise<ActionResult> {
    const result = await requestJson("/api/invitations", {
      method: "DELETE",
      body: action === "delete" ? { invitationId, action } : { invitationId },
      fallbackError:
        action === "delete"
          ? "Não foi possível excluir o registro."
          : "Não foi possível desvincular o acesso.",
    });

    if (!result.ok) {
      return { error: result.error };
    }

    await reload();

    return { error: null };
  }

  return { invitations, loading, loadError, invite, removeAccess };
}
