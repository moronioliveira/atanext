import { developerCredit } from "@/content/site";
import styles from "./DeveloperCredit.module.css";

type DeveloperCreditProps = {
  tone?: "dark" | "light";
};

/** "Desenvolvido por Solid Solutions", com link para o site do estúdio. */
export function DeveloperCredit({ tone = "dark" }: DeveloperCreditProps) {
  return (
    <p className={`${styles.credit} ${tone === "light" ? styles.light : ""}`}>
      {developerCredit.label}{" "}
      <a href={developerCredit.url} target="_blank" rel="noopener noreferrer">
        {developerCredit.name}
      </a>
    </p>
  );
}
