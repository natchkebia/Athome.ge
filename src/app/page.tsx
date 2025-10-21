import styles from "./page.module.css";
import TopBar from "@/components/TopBar/TopBar";
import Header from "@/components/header/Header";
import HeroSlider from "@/components/hero/HeroSlider";
import Navbar from "@/components/navbar/Navbar";
import Categories from "@/components/categorSection/Categori";
import Discount from "@/components/discount/Discount";
import Service from "@/components/service/Service";
import ComputersSection from "@/components/computersSectio/ComputersSectio";
import MonitorsSection from "@/components/monitors/Monitors";

export default function Home() {
  return (
    <div className={styles.page}>
      <TopBar />
      <Header />
      <Navbar/>
      <main className={styles.main}>
       < HeroSlider/>
       <Categories/>
       <Discount/>
       <Service/>
       <ComputersSection/>
       <MonitorsSection/>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
