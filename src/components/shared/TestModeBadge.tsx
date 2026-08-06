"use client";

import styles from "./TestModeBadge.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export default function TestModeBadge() {
  const en = useStorefrontLocale() === "en";
  return (
    <div className={styles.badge} role="status" aria-label={en ? "Test mode" : "სატესტო რეჟიმი"}>
      <span className={styles.dot} />
      <span className={styles.text}>{en ? "Website is in test mode" : "საიტი სატესტო რეჟიმშია"}</span>
    </div>
  );
}
