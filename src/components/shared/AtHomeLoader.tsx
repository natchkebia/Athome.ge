import styles from "./AtHomeLoader.module.scss";

type AtHomeLoaderProps = {
  label?: string;
  variant?: "page" | "section" | "inline" | "overlay";
};

export default function AtHomeLoader({
  variant = "section",
}: AtHomeLoaderProps) {
  return (
    <div
      className={`${styles.loader} ${styles[variant]}`}
      role="status"
      aria-label="იტვირთება"
    >
      <div className={styles.mark} aria-hidden="true">
        <img src="/icons/Logo.svg" alt="" className={styles.logo} />
        <span className={styles.bar} />
      </div>
    </div>
  );
}
