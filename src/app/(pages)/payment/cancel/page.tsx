"use client";

import Link from "next/link";
import styles from "../result/page.module.scss";

export default function PaymentCancelPage() {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.icon} ${styles.failed}`}>✕</div>
      <h1 className={styles.title}>გადახდა გაუქმდა</h1>
      <p className={styles.subtitle}>
        თქვენ შეწყვიტეთ გადახდა. შეკვეთა შენახულია — გადახდის გამეორება შეგიძლიათ
        შეკვეთების გვერდიდან.
      </p>
      <div className={styles.actions}>
        <Link href="/profile?tab=orders" className={styles.primaryBtn}>
          ჩემი შეკვეთები
        </Link>
        <Link href="/" className={styles.secondaryBtn}>
          მთავარი გვერდი
        </Link>
      </div>
    </div>
  );
}
