"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Alert } from "./Alert";
import { Button } from "./Button";
import styles from "./ConfirmDialog.module.css";
import { TextField } from "./TextField";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  tone?: "primary" | "danger";
  /** Exige digitar este texto exato para liberar a confirmação. */
  requiredText?: string;
  pending?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Janela de confirmação acessível (usa `<dialog>` nativo): prende o foco,
 * fecha com Esc e devolve o foco ao botão que a abriu.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "danger",
  requiredText,
  pending = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [typedText, setTypedText] = useState("");
  const canConfirm = !requiredText || typedText === requiredText;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal?.();
    }

    if (!open && dialog.open) {
      dialog.close?.();
    }
  }, [open]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (canConfirm) {
      onConfirm();
    }
  }

  function cancel() {
    setTypedText("");
    onCancel();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="confirm-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        cancel();
      }}
    >
      {open && (
        <form className={styles.body} onSubmit={submit}>
          <h2 id="confirm-dialog-title" className={styles.title}>
            {title}
          </h2>
          <div className={styles.description}>{description}</div>
          {requiredText && (
            <TextField
              label={`Digite "${requiredText}" para confirmar`}
              value={typedText}
              autoComplete="off"
              onChange={(event) => setTypedText(event.target.value)}
            />
          )}
          {error && <Alert tone="error">{error}</Alert>}
          <div className={styles.actions}>
            <Button variant="ghost" onClick={cancel} disabled={pending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={tone === "danger" ? "danger" : "primary"}
              loading={pending}
              disabled={!canConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </form>
      )}
    </dialog>
  );
}
