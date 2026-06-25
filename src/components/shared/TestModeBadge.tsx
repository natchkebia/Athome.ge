import styles from "./TestModeBadge.module.scss";

export default function TestModeBadge() {
  return (
    <div className={styles.badge} role="status" aria-label="სატესტო რეჟიმი">
      <span className={styles.dot} />
      <span className={styles.text}>საიტი სატესტო რეჟიმშია</span>
    </div>
  );
}
