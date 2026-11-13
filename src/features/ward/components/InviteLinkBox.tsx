"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import styles from "./WardPanels.module.css";

type InviteLinkBoxProps = {
  link: string;
};

/** Mostra o link de cadastro do convite com um botão para copiar. */
export function InviteLinkBox({ link }: InviteLinkBoxProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.linkBox}>
      <code className={styles.link}>{link}</code>
      <Button
        size="sm"
        variant="secondary"
        icon={copied ? "check" : "copy"}
        onClick={() => void copyLink()}
      >
        {copied ? "Copiado" : "Copiar link"}
      </Button>
    </div>
  );
}
