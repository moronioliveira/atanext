import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { Spinner } from "@/components/ui/Spinner";
import styles from "./FullPageStatus.module.css";

type FullPageStatusProps = {
  message: string;
  loading?: boolean;
  action?: ReactNode;
};

/** Tela inteira de carregamento ou erro (antes de a ala ser identificada). */
export function FullPageStatus({ message, loading = true, action }: FullPageStatusProps) {
  return (
    <div className={styles.page}>
      <LogoMark size={52} />
      <div className={styles.message}>
        {loading && <Spinner size={18} />}
        <p role={loading ? "status" : "alert"}>{message}</p>
      </div>
      {action}
    </div>
  );
}
