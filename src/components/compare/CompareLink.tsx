"use client";

import Link from "next/link";
import { useCompare } from "@/contexts/CompareContext";
import styles from "./CompareLink.module.scss";

export default function CompareLink() {
  const { items } = useCompare();

  return (
    <Link href="/compare" className={styles.wrapper} aria-label="შედარება">
      <img src="/icons/Arrows.svg" alt="compare" className={styles.icon} />
      {items.length > 0 && <span className={styles.badge}>{items.length}</span>}
    </Link>
  );
}
