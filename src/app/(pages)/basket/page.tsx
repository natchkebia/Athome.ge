"use client";

import styles from "./basket.module.scss";

export default function BasketFullPage() {
  return (
    <div className={styles.basketPage}>
      <h1 className={styles.title}>შენი კალათა</h1>

      <div className={styles.contentBox}>
        <div>
          <h2 className={styles.subtitle}>შენი კალათა ცარიელია</h2>
          <p className={styles.text}>
            დაამატე პროდუქტები და შეამოწმე აქ შენი კალათის შიგთავსი
          </p>
          <img
            src="/icons/Basket.svg"
            alt="empty basket"
            className={styles.image}
          />
        </div>

        <button className={styles.button}>გადადი პროდუქტებზე</button>
      </div>
    </div>
  );
}
