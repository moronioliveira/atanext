"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { getWardRoleLabel } from "@/lib/ward";
import type { WardMembership } from "@/types/ward";
import { useWardAccountActions } from "../hooks/useWardAccountActions";
import styles from "./AccountMenu.module.css";

type PendingConfirmation = "leave" | "delete" | null;

type AccountMenuProps = {
  ward: WardMembership;
};

export function AccountMenu({ ward }: AccountMenuProps) {
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<PendingConfirmation>(null);
  const actions = useWardAccountActions();
  const isLeader = ward.role === "leader";

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function askConfirmation(kind: PendingConfirmation) {
    setOpen(false);
    actions.clearError();
    setConfirmation(kind);
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={styles.avatar} aria-hidden="true">
          {ward.wardName.charAt(0).toUpperCase()}
        </span>
        <span className={styles.identity}>
          <strong>{ward.wardName}</strong>
          <small>{getWardRoleLabel(ward.role)}</small>
        </span>
        <Icon name="chevronDown" size={16} className={styles.chevron} />
      </button>

      {open && (
        <div className={styles.menu} id={menuId}>
          <Link href="/admin/wards" className={styles.item} onClick={() => setOpen(false)}>
            <Icon name="shield" size={16} />
            Alas cadastradas
          </Link>
          {!isLeader && (
            <button type="button" className={styles.item} onClick={() => askConfirmation("leave")}>
              <Icon name="logOut" size={16} />
              Sair da ala
            </button>
          )}
          {isLeader && (
            <button
              type="button"
              className={`${styles.item} ${styles.danger}`}
              onClick={() => askConfirmation("delete")}
            >
              <Icon name="trash" size={16} />
              Excluir ala
            </button>
          )}
          <hr className={styles.separator} />
          <button
            type="button"
            className={styles.item}
            disabled={actions.pending}
            onClick={() => void actions.signOut()}
          >
            <Icon name="logOut" size={16} />
            Sair da conta
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmation === "leave"}
        title="Sair desta ala?"
        description="Você perderá o acesso aos planejamentos da ala até receber um novo convite."
        confirmLabel="Sair da ala"
        pending={actions.pending}
        error={actions.error}
        onConfirm={() => void actions.leaveWard()}
        onCancel={() => setConfirmation(null)}
      />
      <ConfirmDialog
        open={confirmation === "delete"}
        title="Excluir a ala?"
        description="Todos os planejamentos, membros e convites da ala serão apagados. Esta ação não pode ser desfeita."
        confirmLabel="Excluir definitivamente"
        requiredText={ward.wardName}
        pending={actions.pending}
        error={actions.error}
        onConfirm={() => void actions.deleteWard(ward.wardName)}
        onCancel={() => setConfirmation(null)}
      />
    </div>
  );
}
