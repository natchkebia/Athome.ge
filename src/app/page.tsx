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
import GamingSection from "@/components/gaming/GamingSection";
import ConfiguratorBanner from "@/components/ConfiguratorBanner/ConfiguratorBanner";
import { headers } from "next/headers";
import { StorefrontLocale } from "@/lib/i18n/locale";
import {
  getDealStorefrontProductsServer,
  getStorefrontBannersServer,
  getStorefrontBrandsServer,
  getStorefrontCategoriesServer,
  getStorefrontHomeServer,
  getStorefrontProductsByCategoryServer,
  getStorefrontTablesAndChairsServer,
} from "@/lib/api/storefrontServer";

export const revalidate = 60;

export default async function Home() {
  const requestHeaders = await headers();
  const locale = (
    requestHeaders.get("x-lang") === "en" ? "en" : "ka"
  ) as StorefrontLocale;

  const [
    homeData,
    bannersData,
    categoriesData,
    dealsData,
    computersData,
    monitorsData,
    peripheryData,
    tablesData,
    brandsData,
  ] = await Promise.all([
    getStorefrontHomeServer(locale),
    getStorefrontBannersServer(locale),
    getStorefrontCategoriesServer(locale),
    getDealStorefrontProductsServer(48, locale),
    getStorefrontProductsByCategoryServer(
      "geimingsarendero-kompiuterebi",
      8,
      locale
    ),
    getStorefrontProductsByCategoryServer("monitor", 8, locale),
    getStorefrontProductsByCategoryServer("peripherials", 8, locale),
    getStorefrontTablesAndChairsServer(12, locale),
    getStorefrontBrandsServer({ featured: true, pageSize: 24 }, locale),
  ]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <HeroSlider initialHome={homeData} initialBanners={bannersData} />
        <Categories initialCategories={categoriesData} />
        <Discount initialProducts={dealsData} />
        <ComputersSection initialProducts={computersData} />
        <MonitorsSection initialProducts={monitorsData} />
        <PeripherySection initialProducts={peripheryData} />
        <TablesAndChairs initialProducts={tablesData} />
        <GamingSection />
        <ConfiguratorBanner />
        <Service />
        <BrandSlider initialBrands={brandsData} />
      </main>
    </div>
  );
}

