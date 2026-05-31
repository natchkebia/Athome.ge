import styles from "./AtHomeLoader.module.scss";

type AtHomeLoaderProps = {
  label?: string;
  variant?: "page" | "section" | "inline" | "overlay";
};

export default function AtHomeLoader({
  variant = "section",
}: AtHomeLoaderProps) {
  return (
    <div className={`${styles.loader} ${styles[variant]}`} role="status">
      <div className={styles.mark} aria-hidden="true">
        <span className={styles.orbit} />
        <span className={styles.particleOne} />
        <span className={styles.particleTwo} />
        <img src="/icons/Logo.svg" alt="" className={styles.logo} />
      </div>
    </div>
  );
}
