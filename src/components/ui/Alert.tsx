import type { ReactNode } from "react";
import styles from "./Alert.module.css";
import { Icon, type IconName } from "./Icon";

type AlertTone = "info" | "success" | "error";

const toneIcons: Record<AlertTone, IconName> = {
  info: "fileText",
  success: "check",
  error: "x",
};

type AlertProps = {
  tone?: AlertTone;
  children: ReactNode;
};

/**
 * Mensagem de retorno. Erros usam `role="alert"` (anunciados na hora);
 * os demais tons usam `role="status"`.
 */
export function Alert({ tone = "info", children }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[tone]}`} role={tone === "error" ? "alert" : "status"}>
      <Icon name={toneIcons[tone]} size={16} className={styles.icon} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
