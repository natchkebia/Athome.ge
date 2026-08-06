"use client";

import Link from "next/link";
import styles from "./GamingSection.module.css";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

const gamingItems = [
  {
    title: "სათამაშო კონსოლი",
    image: "/images/gaming-console.png",
    slug: "console",
    className: "large",
  },
  {
    title: "გეიმინგ კლავიატურა",
    image: "/images/gaming-keyboard.png",
    slug: "keyboard",
    className: "small",
  },
  {
    title: "გეიმინგ მონიტორი",
    image: "/images/gaming-monitor.png",
    slug: "monitor",
    className: "small",
  },
  {
    title: "გეიმინგ ნოუთბუქი",
    image: "/images/gaming-laptop.png",
    slug: "laptop",
    className: "wide",
  },
  {
    title: "გეიმინგ სავარძელი",
    image: "/images/gaming-chair.png",
    slug: "gaming-chair",
    className: "large",
  },
];

export default function GamingSection() {
  const locale = useStorefrontLocale();
  const englishTitles = ["Gaming console", "Gaming keyboard", "Gaming monitor", "Gaming laptop", "Gaming chair"];
  const title = (index: number) => locale === "en" ? englishTitles[index] : gamingItems[index].title;
  return (
    <section className={styles.gamingSection}>
      <div className={styles.gamingGrid}>
        <Link
          href={`/gaming/${gamingItems[0].slug}`}
          className={`${styles.gamingCard} ${styles.large}`}
        >
          <img src={gamingItems[0].image} alt={title(0)} />
          <span>{title(0)}</span>
        </Link>

        <div className={styles.middleGrid}>
          <Link
            href={`/gaming/${gamingItems[1].slug}`}
            className={`${styles.gamingCard} ${styles.small}`}
          >
            <img src={gamingItems[1].image} alt={title(1)} />
            <span>{title(1)}</span>
          </Link>

          <Link
            href={`/gaming/${gamingItems[2].slug}`}
            className={`${styles.gamingCard} ${styles.small}`}
          >
            <img src={gamingItems[2].image} alt={title(2)} />
            <span>{title(2)}</span>
          </Link>

          <Link
            href={`/gaming/${gamingItems[3].slug}`}
            className={`${styles.gamingCard} ${styles.wide}`}
          >
            <img src={gamingItems[3].image} alt={title(3)} />
            <span>{title(3)}</span>
          </Link>
        </div>

        <Link
          href={`/gaming/${gamingItems[4].slug}`}
          className={`${styles.gamingCard} ${styles.large}`}
        >
          <img src={gamingItems[4].image} alt={title(4)} />
          <span>{title(4)}</span>
        </Link>
      </div>
    </section>
  );
}
