import styles from "./AtHomeLoader.module.scss";

type AtHomeLoaderProps = {
  label?: string;
  variant?: "page" | "section" | "inline";
};

export default function AtHomeLoader({
  label = "იტვირთება",
  variant = "section",
}: AtHomeLoaderProps) {
  return (
    <div className={`${styles.loader} ${styles[variant]}`} role="status">
      <div className={styles.mark} aria-hidden="true">
        <span className={styles.wing} />
        <span className={styles.dot} />
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
