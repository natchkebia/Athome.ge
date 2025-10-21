import Image from "next/image";
import styles from "./page.module.css";
import TopBar from "@/components/TopBar/TopBar";
import Header from "@/components/header/Header";
import Slider from "@/components/slider/Slider";
import DiscountSlider from "@/components/discountSlider/DiscountSlider";
import HeroSlider from "@/components/hero/HeroSlider";
import Navbar from "@/components/navbar/Navbar";
import Categories from "@/components/categorSection/Categori";

export default function Home() {
  return (
    <div className={styles.page}>
      <TopBar />
      <Header />
      <Navbar/>
      <main className={styles.main}>
       < HeroSlider/>
       <Categories/>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
