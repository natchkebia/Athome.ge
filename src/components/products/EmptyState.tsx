"use client";

import styles from "./EmptyState.module.scss";

export default function EmptyState() {
  return (
    <div className={styles.wrapper}>
      <img src="/icons/404.svg" alt="404" />
      <h2>სამწუხაროდ გვერდი ვერ მოიძებნა</h2>
      <button onClick={() => (window.location.href = "/")}>მთავარი გვერდი</button>
    </div>
  );
}
