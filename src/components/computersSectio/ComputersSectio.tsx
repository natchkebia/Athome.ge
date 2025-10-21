"use client";

import styles from "./ComputersSectio.module.scss";
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

export default function ComputersSection() {
  const products: Product[] = [
    {
      id: 1,
      image: "/images/DiscountPc.png",
      title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
      newPrice: 9500,
      category: "კომპიუტერები",
      isNew: true,
    },
    {
      id: 2,
      image: "/images/DiscountPc.png",
      title: "SAMSUNG ODYSSEY G5 27'' CURVED MONITOR",
      newPrice: 2000,
      category: "კომპიუტერებ",
      isNew: true,
    },
    {
      id: 3,
      image: "/images/DiscountPc.png",
      title: "2E GAMING CHAIR HEBI (BLACK/GREEN)",
      newPrice: 5000,
      category: "კომპიუტერებ",
      isNew: true,
    },
    {
      id: 4,
      image: "/images/DiscountPc.png",
      title: "HYPERX CLOUD ALPHA WIRELESS",
      newPrice: 6000,
      category: "კომპიუტერებ",
      isNew: true,
    },
    {
      id: 5,
      image: "/images/DiscountPc.png",
      title: "ASUS TUF GAMING LAPTOP",
      category: "კომპიუტერებ",
      newPrice: 4200,
      isNew: true,
    },
    {
      id: 6,
      image: "/images/DiscountPc.png",
      title: "NVIDIA RTX 4070TI GRAPHICS CARD",
      newPrice: 4200,
      category: "კომპიუტერებ",
      isNew: true,
    },
  ];

  const filteredProducts = products.filter((product) => product.isNew);

  return (
    <div className={styles.newSection}>
      <div className={styles.sectionHeader}>
        <img src="./icons/Computer.svg" alt="new" />
        <span className={styles.sectionTitle}>კომპიუტერები</span>
      </div>
      <DiscountSlider
        products={filteredProducts.map((p) => ({
          ...p,
          oldPrice: undefined, 
        }))}
      />
    </div>
  );
}
