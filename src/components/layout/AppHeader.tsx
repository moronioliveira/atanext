"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { mainNavigation } from "@/content/site";
import styles from "./AppHeader.module.css";

type AppHeaderProps = {
  account?: ReactNode;
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Cabeçalho das telas internas: marca, navegação principal e conta. */
export function AppHeader({ account }: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Atas+, ir para o planejamento">
          <Logo size={34} />
        </Link>
        <nav className={styles.nav} aria-label="Navegação principal">
          {mainNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.navLink}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.account}>{account}</div>
      </div>
    </header>
  );
}
