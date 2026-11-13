import { siteConfig } from "@/content/site";
import styles from "./Logo.module.css";

type LogoMarkProps = {
  size?: number;
  className?: string;
};

/**
 * Símbolo do Atas+: uma página de ata com telhado e torre de capela.
 * O canto dobrado em dourado conversa com o "+" do nome.
 * Mantenha os traços sincronizados com `src/app/icon.svg`.
 */
export function LogoMark({ size = 40, className }: LogoMarkProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="64" height="64" rx="16" fill="var(--ink)" />
      <path d="M30.3 17 L32 5.5 L33.7 17 Z" fill="var(--cyan)" />
      <path d="M19 30 H45 V43.5 L37.5 51 H21.5 a2.5 2.5 0 0 1 -2.5 -2.5 Z" fill="var(--surface)" />
      <path d="M45 43.5 L37.5 51 V46 a2.5 2.5 0 0 1 2.5 -2.5 Z" fill="var(--gold)" />
      <path
        d="M13.5 31 L32 15.5 L50.5 31"
        fill="none"
        stroke="var(--cyan)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.5 35.5 H39.5 M24.5 41 H39.5 M24.5 46.5 H32"
        stroke="var(--blue)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

type LogoProps = {
  tone?: "dark" | "light";
  size?: number;
  showTagline?: boolean;
};

/** Símbolo + nome. Use `tone="light"` sobre fundos escuros. */
export function Logo({ tone = "dark", size = 36, showTagline = false }: LogoProps) {
  return (
    <span className={`${styles.logo} ${tone === "light" ? styles.light : ""}`}>
      <LogoMark size={size} />
      <span className={styles.text}>
        <span className={styles.wordmark}>
          {siteConfig.shortName}
          <span className={styles.plus}>+</span>
        </span>
        {showTagline && <span className={styles.tagline}>{siteConfig.tagline}</span>}
      </span>
      <span className="sr-only">{siteConfig.name}</span>
    </span>
  );
}
