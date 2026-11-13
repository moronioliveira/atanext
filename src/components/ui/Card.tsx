import type { ReactNode } from "react";
import styles from "./Card.module.css";

type CardProps = {
  as?: "section" | "div" | "article";
  className?: string;
  children: ReactNode;
};

export function Card({ as: Element = "section", className, children }: CardProps) {
  return <Element className={`${styles.card} ${className ?? ""}`}>{children}</Element>;
}

type CardHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  titleAs?: "h2" | "h3";
};

/** Cabeçalho padrão de cartão: rótulo pequeno, título, descrição e ações. */
export function CardHeader({
  eyebrow,
  title,
  description,
  actions,
  titleAs: Title = "h2",
}: CardHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerText}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <Title className={styles.title}>{title}</Title>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
