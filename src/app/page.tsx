import styles from "./page.module.css";
import HeroSlider from "@/components/hero/HeroSlider";
import Categories from "@/components/categorSection/Categori";
import Discount from "@/components/discount/Discount";
import Service from "@/components/service/Service";
import ComputersSection from "@/components/computersSectio/ComputersSectio";
import MonitorsSection from "@/components/monitors/Monitors";
import PeripherySection from "@/components/periphery/Periphery";
import TablesAndChairs from "@/components/tablesAndChairs/TablesAndChairs";
import BrandSlider from "@/components/brands/BrandSlider";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <HeroSlider />
        <Categories />
        <Discount />
        <Service />
        <ComputersSection />
        <MonitorsSection />
        <PeripherySection />
        <TablesAndChairs />
        <BrandSlider />
      </main>
    </div>
  );
}
