import Link from "next/link";
import styles from "./GamingSection.module.css";

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
  return (
    <section className={styles.gamingSection}>
      <div className={styles.gamingGrid}>
        <Link
          href={`/gaming/${gamingItems[0].slug}`}
          className={`${styles.gamingCard} ${styles.large}`}
        >
          <img src={gamingItems[0].image} alt={gamingItems[0].title} />
          <span>{gamingItems[0].title}</span>
        </Link>

        <div className={styles.middleGrid}>
          <Link
            href={`/gaming/${gamingItems[1].slug}`}
            className={`${styles.gamingCard} ${styles.small}`}
          >
            <img src={gamingItems[1].image} alt={gamingItems[1].title} />
            <span>{gamingItems[1].title}</span>
          </Link>

          <Link
            href={`/gaming/${gamingItems[2].slug}`}
            className={`${styles.gamingCard} ${styles.small}`}
          >
            <img src={gamingItems[2].image} alt={gamingItems[2].title} />
            <span>{gamingItems[2].title}</span>
          </Link>

          <Link
            href={`/gaming/${gamingItems[3].slug}`}
            className={`${styles.gamingCard} ${styles.wide}`}
          >
            <img src={gamingItems[3].image} alt={gamingItems[3].title} />
            <span>{gamingItems[3].title}</span>
          </Link>
        </div>

        <Link
          href={`/gaming/${gamingItems[4].slug}`}
          className={`${styles.gamingCard} ${styles.large}`}
        >
          <img src={gamingItems[4].image} alt={gamingItems[4].title} />
          <span>{gamingItems[4].title}</span>
        </Link>
      </div>
    </section>
  );
}
