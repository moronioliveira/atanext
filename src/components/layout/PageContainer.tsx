import type { ReactNode } from "react";
import styles from "./PageContainer.module.css";

type PageContainerProps = {
  children: ReactNode;
};

/** Área central das telas internas, com largura máxima e respiro lateral. */
export function PageContainer({ children }: PageContainerProps) {
  return <main className={styles.container}>{children}</main>;
}
