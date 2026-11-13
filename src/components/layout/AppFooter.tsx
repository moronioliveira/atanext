import { siteConfig } from "@/content/site";
import styles from "./AppFooter.module.css";
import { DeveloperCredit } from "./DeveloperCredit";

/** Rodapé das telas internas. */
export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>{siteConfig.name}</p>
        <DeveloperCredit />
      </div>
    </footer>
  );
}
