"use client";

import styles from "./TestModeBadge.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export default function TestModeBadge() {
  const en = useStorefrontLocale() === "en";

  return (
    <aside
      className={styles.banner}
      aria-label={en ? "Test website notice" : "სატესტო საიტის შეტყობინება"}
    >
      <div className={styles.inner}>
        <div className={styles.message}>
          <span className={styles.status}>
            <span className={styles.dot} aria-hidden="true" />
            <strong>{en ? "Test version" : "სატესტო ვერსია"}</strong>
          </span>
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.description}>
            {en
              ? "You are viewing a test environment. For shopping, please use our main website."
              : "თქვენ იმყოფებით სატესტო გარემოში. შესაძენად გამოიყენეთ ჩვენი მთავარი საიტი."}
          </span>
        </div>

        <a className={styles.link} href="https://athome.ge/">
          <span>{en ? "Go to athome.ge" : "მთავარ საიტზე გადასვლა"}</span>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4 10h11M11 6l4 4-4 4" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
