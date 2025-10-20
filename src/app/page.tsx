import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <img src="./icons/Monitor.svg" alt="" />
        <img src="./icons/Monitor-black.svg" alt="" />
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
