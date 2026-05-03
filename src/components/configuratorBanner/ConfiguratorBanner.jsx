import Link from "next/link";
import styles from "./ConfiguratorBanner.module.css";

export default function ConfiguratorBanner() {
  return (
    <section className={styles.configuratorSection}>
      <Link href="/configurator" className={styles.banner}>
        <div className={styles.vectorCircle}></div>
        <div className={styles.vectorDots}></div>
        <div className={styles.vectorDotsRight}></div>
        <div className={styles.waveOne}></div>
        <div className={styles.waveTwo}></div>
        <span className={styles.squareOne}></span>
        <span className={styles.squareTwo}></span>
        <span className={styles.circleSmall}></span>

        <div className={styles.imageSide}>
          <img
            src="/images/configurator-parts.png"
            alt="კომპიუტერის კონფიგურატორი"
          />
        </div>

        <div className={styles.contentSide}>
          <h2>ააწყვე შენი ოცნების კომპიუტერი ვირტუალურად კონფიგურატორის დახმარებით</h2>
          <p>სისტემური ბლოკი იწყობა შეკვეთიდან 24 საათში.</p>
          <span className={styles.button}>დაიწყე აწყობა</span>
        </div>
      </Link>
    </section>
  );
}