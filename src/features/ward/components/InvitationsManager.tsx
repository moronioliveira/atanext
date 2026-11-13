"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Spinner } from "@/components/ui/Spinner";
import { TextField } from "@/components/ui/TextField";
import { canDeleteInvitation, canRevokeInvitation, getInvitationStatusLabel } from "@/lib/ward";
import type { WardInvitation } from "@/types/ward";
import { useInvitations } from "../hooks/useInvitations";
import { InviteLinkBox } from "./InviteLinkBox";
import styles from "./WardPanels.module.css";

type PendingRemoval = {
  invitation: WardInvitation;
  action: "revoke" | "delete";
};

type Notice = {
  tone: "success" | "error";
  text: string;
};

function getStatusTone(invitation: WardInvitation): BadgeTone {
  if (invitation.status === "pending") {
    return "warning";
  }

  return invitation.memberStatus === "active" ? "success" : "neutral";
}

function getRemovalCopy(removal: PendingRemoval | null) {
  if (removal?.action === "delete") {
    return {
      title: "Excluir este registro?",
      description: `O registro de ${removal.invitation.email} sairá da lista. A conta de login não é excluída.`,
      confirmLabel: "Excluir registro",
      success: "Registro excluído da ala.",
    };
  }

  return {
    title: "Desvincular administrador?",
    description: `${removal?.invitation.email ?? ""} perderá o acesso à ala. O histórico é preservado.`,
    confirmLabel: "Desvincular",
    success: "Acesso desvinculado.",
  };
}

/** Líder convida administradores e gerencia quem tem acesso à ala. */
export function InvitationsManager() {
  const { invitations, loading, loadError, invite, removeAccess } = useInvitations();
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [inviteLink, setInviteLink] = useState("");
  const [removal, setRemoval] = useState<PendingRemoval | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removalError, setRemovalError] = useState("");
  const removalCopy = getRemovalCopy(removal);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviting(true);
    setNotice(null);
    setInviteLink("");

    const result = await invite(email);

    setInviting(false);

    if (result.error) {
      setNotice({ tone: "error", text: result.error });
      return;
    }

    setEmail("");
    setInviteLink(result.link ?? "");
    setNotice({ tone: "success", text: "Convite registrado. Envie o link abaixo para a pessoa." });
  }

  async function confirmRemoval() {
    if (!removal) {
      return;
    }

    setRemoving(true);
    setRemovalError("");

    const result = await removeAccess(removal.invitation.id, removal.action);

    setRemoving(false);

    if (result.error) {
      setRemovalError(result.error);
      return;
    }

    setNotice({ tone: "success", text: removalCopy.success });
    setRemoval(null);
  }

  function cancelRemoval() {
    setRemoval(null);
    setRemovalError("");
  }

  return (
    <Card>
      <CardHeader
        eyebrow="Acesso à ala"
        title="Administradores"
        description="Convide quem ajuda a planejar as reuniões. A pessoa cria a própria senha pelo link de cadastro."
      />

      <form className={styles.inlineForm} onSubmit={submit}>
        <TextField
          label="E-mail do administrador"
          type="email"
          required
          autoComplete="email"
          placeholder="nome@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button type="submit" icon="mail" loading={inviting}>
          Convidar
        </Button>
      </form>

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}
      {inviteLink && <InviteLinkBox link={inviteLink} />}

      {loading && <Spinner label="Carregando convites" />}
      {loadError && <Alert tone="error">{loadError}</Alert>}
      {!loading && !loadError && invitations.length === 0 && (
        <p className={styles.empty}>Nenhum administrador convidado ainda.</p>
      )}

      {invitations.length > 0 && (
        <ul className={styles.list} aria-label="Pessoas convidadas">
          {invitations.map((invitation) => (
            <li key={invitation.id} className={styles.row}>
              <div className={styles.rowText}>
                <strong>{invitation.email}</strong>
                <Badge tone={getStatusTone(invitation)}>
                  {getInvitationStatusLabel(invitation)}
                </Badge>
              </div>
              {canRevokeInvitation(invitation) && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setRemoval({ invitation, action: "revoke" })}
                >
                  Desvincular
                </Button>
              )}
              {canDeleteInvitation(invitation) && (
                <Button
                  size="sm"
                  variant="ghost"
                  icon="trash"
                  onClick={() => setRemoval({ invitation, action: "delete" })}
                >
                  Excluir registro
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={removal !== null}
        title={removalCopy.title}
        description={removalCopy.description}
        confirmLabel={removalCopy.confirmLabel}
        pending={removing}
        error={removalError}
        onConfirm={() => void confirmRemoval()}
        onCancel={cancelRemoval}
      />
    </Card>
  );
}
