import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { authHighlights, siteConfig } from "@/content/site";
import styles from "./AuthLayout.module.css";
import { DeveloperCredit } from "./DeveloperCredit";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

/** Telas de acesso: painel da marca à esquerda e formulário à direita. */
export function AuthLayout({ eyebrow, title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <aside className={styles.brandPanel}>
        <Logo tone="light" size={44} showTagline />
        <div className={styles.pitch}>
          <h2>{siteConfig.description}</h2>
          <ul>
            {authHighlights.map((highlight) => (
              <li key={highlight}>
                <Icon name="check" size={16} />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.mobileLogo}>
          <Logo size={36} />
        </div>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1>{title}</h1>
            <p className={styles.description}>{description}</p>
          </header>
          {children}
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
        <DeveloperCredit />
      </main>
    </div>
  );
}
