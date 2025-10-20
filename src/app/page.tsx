import Image from "next/image";
import styles from "./page.module.css";
import TopBar from "@/components/TopBar/TopBar";
import Header from "@/components/header/Header";

export default function Home() {
  return (
    <div className={styles.page}>
      <TopBar/>
      <Header/>
      <main className={styles.main}>
    
      
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
