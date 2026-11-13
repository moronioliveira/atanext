"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { formatLongDate } from "@/lib/meeting";
import type { SundaySchedule } from "@/types/meeting";
import { usePreviewScale, usePrintFit } from "../hooks/usePrintFit";
import styles from "./Minutes.module.css";
import { MinutesDocument } from "./MinutesDocument";

type MinutesPreviewProps = {
  schedule: SundaySchedule;
  sundayNumber: number;
  date: Date | null;
  wardName: string;
  hasUnsavedChanges: boolean;
  onClose: () => void;
};

/** Marca o <body> para que a impressão mostre somente a ata. */
function useMinutesPrintMode() {
  useEffect(() => {
    document.body.dataset.minutesOpen = "true";

    return () => {
      delete document.body.dataset.minutesOpen;
    };
  }, []);
}

/** Prévia em tela cheia da ata, com impressão em uma folha A4. */
export function MinutesPreview({
  schedule,
  sundayNumber,
  date,
  wardName,
  hasUnsavedChanges,
  onClose,
}: MinutesPreviewProps) {
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const { stageRef, pageRef } = usePreviewScale<HTMLElement>();

  usePrintFit(pageRef, JSON.stringify({ schedule, sundayNumber, wardName }));
  useMinutesPrintMode();

  useEffect(() => {
    backButtonRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return createPortal(
    <div
      className={styles.overlay}
      data-minutes-root
      role="dialog"
      aria-modal="true"
      aria-label="Prévia da ata"
    >
      <div className={styles.toolbar}>
        <div className={styles.toolbarInner}>
          <Button ref={backButtonRef} variant="secondary" icon="chevronLeft" onClick={onClose}>
            Voltar
          </Button>
          <div className={styles.toolbarTitle}>
            <strong>Prévia da ata</strong>
            <span>
              Domingo {sundayNumber} · {formatLongDate(date)}
            </span>
          </div>
          <Button icon="printer" onClick={() => window.print()}>
            Imprimir ou salvar PDF
          </Button>
        </div>
        {hasUnsavedChanges && (
          <div className={styles.toolbarNotice}>
            <Alert tone="info">
              Há alterações ainda não salvas. Salve o planejamento para manter esta versão da ata.
            </Alert>
          </div>
        )}
      </div>

      <div className={styles.stage} ref={stageRef}>
        <MinutesDocument
          ref={pageRef}
          schedule={schedule}
          sundayNumber={sundayNumber}
          date={date}
          wardName={wardName}
        />
      </div>
    </div>,
    document.body,
  );
}
