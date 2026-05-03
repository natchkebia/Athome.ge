import styles from "./GamingSection.module.css";

const gamingItems = [
  {
    title: "სათამაშო კონსოლი",
    image: "/images/gaming-console.png",
    className: "large",
  },
  {
    title: "გეიმინგ კლავიატურა",
    image: "/images/gaming-keyboard.png",
    className: "small",
  },
  {
    title: "გეიმინგ მონიტორი",
    image: "/images/gaming-monitor.png",
    className: "small",
  },
  {
    title: "გეიმინგ ნოუთბუქი",
    image: "/images/gaming-laptop.png",
    className: "wide",
  },
  {
    title: "გეიმინგ სავარძელი",
    image: "/images/gaming-chair.png",
    className: "large",
  },
];

export default function GamingSection() {
  return (
    <section className={styles.gamingSection}>
      <div className={styles.gamingGrid}>
        <a href="#" className={`${styles.gamingCard} ${styles.large}`}>
          <img src={gamingItems[0].image} alt={gamingItems[0].title} />
          <span>{gamingItems[0].title}</span>
        </a>

        <div className={styles.middleGrid}>
          <a href="#" className={`${styles.gamingCard} ${styles.small}`}>
            <img src={gamingItems[1].image} alt={gamingItems[1].title} />
            <span>{gamingItems[1].title}</span>
          </a>

          <a href="#" className={`${styles.gamingCard} ${styles.small}`}>
            <img src={gamingItems[2].image} alt={gamingItems[2].title} />
            <span>{gamingItems[2].title}</span>
          </a>

          <a href="#" className={`${styles.gamingCard} ${styles.wide}`}>
            <img src={gamingItems[3].image} alt={gamingItems[3].title} />
            <span>{gamingItems[3].title}</span>
          </a>
        </div>

        <a href="#" className={`${styles.gamingCard} ${styles.large}`}>
          <img src={gamingItems[4].image} alt={gamingItems[4].title} />
          <span>{gamingItems[4].title}</span>
        </a>
      </div>
    </section>
  );
}
