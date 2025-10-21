"use client";

import styles from "./Monitors.module.scss";
import DiscountSlider from "../discount/DiscountSlider";

interface Product {
  id: number;
  discount?: number;
  image: string;
  title: string;
  oldPrice?: number;
  newPrice?: number;
  category: string;
  isNew?: boolean;
}

export default function MonitorsSection() {
  const products: Product[] = [
    {
      id: 1,
      image: "/images/DiscountMonitor.png",
      title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
      newPrice: 9500,
      category: "მონიტორი",
      isNew: true,
    },
    {
      id: 2,
      image: "/images/DiscountMonitor.png",
      title: "SAMSUNG ODYSSEY G5 27'' CURVED MONITOR",
      newPrice: 2000,
      category: "მონიტორი",
    },
    {
      id: 3,
      image: "/images/DiscountMonitor.png",
      title: "2E GAMING CHAIR HEBI (BLACK/GREEN)",
      newPrice: 5000,
      category: "მონიტორი",
      isNew: true,
    },
    {
      id: 4,
      image: "/images/DiscountMonitor.png",
      title: "HYPERX CLOUD ALPHA WIRELESS",
      newPrice: 6000,
      category: "მონიტორი",
    },
    {
      id: 5,
      image: "/images/DiscountMonitor.png",
      title: "ASUS TUF GAMING LAPTOP",
      category: "მონიტორი",
      newPrice: 4200,
      isNew: true,
    },
    {
      id: 6,
      image: "/images/DiscountMonitor.png",
      title: "NVIDIA RTX 4070TI GRAPHICS CARD",
      newPrice: 4200,
      category: "მონიტორი",
    },
  ];

  const filteredProducts = products.filter((product) => product.isNew);

  return (
    <div className={styles.newSection}>
      <div className={styles.sectionHeader}>
        <img src="./icons/Computer.svg" alt="new" />
        <span className={styles.sectionTitle}>მონიტორები</span>
      </div>
      <DiscountSlider
        products={products.map((p) => ({
          ...p,
          oldPrice: undefined,
        }))}
      />
    </div>
  );
}
